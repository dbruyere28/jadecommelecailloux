'use client';

import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, Plus, Save, X, Loader2, Image as ImageIcon, Hash, Upload, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Artwork, ArtworkFormData } from '@/types/artwork';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceReady, setMaintenanceReady] = useState(false);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null);
  const [translatingArtworks, setTranslatingArtworks] = useState(false);
  const [translationNotice, setTranslationNotice] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [formData, setFormData] = useState<ArtworkFormData>({
    title: '',
    description: '',
    image: '',
    width: 50,
    height: 50,
    technique: 'Acrylique sur toile',
    price: 50,
    status: 'available',
    year: 2024,
    category: '',
    tags: '',
    cloudinaryPublicId: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = 'artworks_catalog';
  const DELETED_KEY = 'artworks_deleted';

  // Load artworks from API
  const loadArtworks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/artworks');
      const data = await response.json();
      if (data.artworks) {
        setArtworks(data.artworks);
      }
    } catch (error) {
      console.error('Error loading artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtworks();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setPasswordError(false);
        setMaintenanceReady(false);
        try {
          const maintenanceResponse = await fetch('/api/maintenance', { cache: 'no-store' });
          const maintenanceData: { maintenanceEnabled?: boolean; error?: string } = await maintenanceResponse.json();
          if (!maintenanceResponse.ok) throw new Error(maintenanceData.error || 'Impossible de lire le mode maintenance.');
          setMaintenanceEnabled(maintenanceData.maintenanceEnabled === true);
          setMaintenanceReady(true);
          setMaintenanceError(null);
        } catch (error) {
          setMaintenanceError(error instanceof Error ? error.message : 'Impossible de lire le mode maintenance.');
          setMaintenanceReady(false);
        }
      } else {
        setPasswordError(true);
        setTimeout(() => setPasswordError(false), 2000);
      }
    } catch {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const handleToggleMaintenance = async () => {
    setMaintenanceSaving(true);
    setMaintenanceError(null);

    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', enabled: !maintenanceEnabled, password }),
      });
      const data: { maintenanceEnabled?: boolean; error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || 'Impossible de modifier le mode maintenance.');
      setMaintenanceEnabled(data.maintenanceEnabled === true);
    } catch (error) {
      setMaintenanceError(error instanceof Error ? error.message : 'Impossible de modifier le mode maintenance.');
    } finally {
      setMaintenanceSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    // Hard limit at 10MB (Cloudinary limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 10 Mo');
      return;
    }

    // Show uploading state
    setSaveError('Upload de l\'image vers Cloudinary...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'upload');
      }

      // Success - update form with Cloudinary URL
      setImageFile(file);
      setImagePreview(result.url);
      setFormData(prev => ({ 
        ...prev, 
        image: result.url,
        cloudinaryPublicId: result.publicId || '',
      }));
      setSaveError(null);
    } catch (err) {
      console.error('Upload error:', err);
      setSaveError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
    }
  };

  const handleImageUrl = () => {
    if (!imageUrl.trim()) {
      alert('Veuillez entrer une URL valide');
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      alert('URL invalide');
      return;
    }

    // Check if it's a Cloudinary URL to extract public_id
    let publicId = '';
    const cloudinaryMatch = imageUrl.match(/\/upload\/(?:v\d+\/)?([^./]+)/);
    if (cloudinaryMatch) {
      publicId = cloudinaryMatch[1];
    }

    setImagePreview(imageUrl);
    setFormData(prev => ({ 
      ...prev, 
      image: imageUrl,
      cloudinaryPublicId: publicId,
    }));
    setSaveError(null);
    setImageUrl('');
    setImageInputMode('upload'); // Switch back to upload mode after success
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '', cloudinaryPublicId: '' }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setShowForm(false);
    setEditingArtwork(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      width: 50,
      height: 50,
      technique: 'Acrylique sur toile',
      price: 50,
      status: 'available',
      year: 2024,
      category: '',
      tags: '',
      cloudinaryPublicId: '',
    });
    setImagePreview(null);
    setImageFile(null);
    setImageUrl('');
    setImageInputMode('upload');
    setEditingArtwork(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    // Validate required fields
    if (!formData.title.trim()) {
      setSaveError('Le titre est obligatoire');
      setSaving(false);
      return;
    }
    if (!formData.image) {
      setSaveError('Une image est obligatoire');
      setSaving(false);
      return;
    }
    if (formData.width <= 0 || formData.height <= 0) {
      setSaveError('Les dimensions doivent être supérieures à 0');
      setSaving(false);
      return;
    }

    const newArtwork = {
      id: editingArtwork?.id || `art_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      image: formData.image,
      thumbnail: formData.image,
      width: formData.width,
      height: formData.height,
      technique: formData.technique,
      price: formData.price,
      status: formData.status,
      year: formData.year,
      category: formData.category || undefined,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      cloudinaryPublicId: formData.cloudinaryPublicId || undefined,
    };

    try {
      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artwork: newArtwork, action: editingArtwork ? 'update' : 'create', adminPassword: password }),
      });

      const data: { error?: string; translationsGenerated?: boolean; translationWarning?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      if (data.translationWarning) {
        setTranslationNotice(data.translationWarning.includes('DEEPL_AUTH_KEY')
          ? 'Configurez DEEPL_AUTH_KEY dans Vercel pour activer les traductions automatiques.'
          : 'Œuvre enregistrée en français, mais ses traductions automatiques ont échoué.');
      } else if (data.translationsGenerated) {
        setTranslationNotice('Traductions anglaises et allemandes générées automatiquement.');
      }

      // Refresh artworks list
      await loadArtworks();
      resetForm();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        setSaveError('L\'image est trop volumineuse pour le stockage local. Réduisez la taille de l\'image (max ~1-2 Mo recommandé).');
      } else {
        setSaveError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde. Réessayez.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setFormData({
      title: artwork.title,
      description: artwork.description || '',
      image: artwork.image,
      width: artwork.width,
      height: artwork.height,
      technique: artwork.technique,
      price: artwork.price,
      status: artwork.status,
      year: artwork.year,
      category: artwork.category || '',
      tags: artwork.tags?.join(', ') || '',
      cloudinaryPublicId: artwork.cloudinaryPublicId || '',
    });
    setImagePreview(artwork.image);
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette œuvre ?')) {
      // Find the artwork to get cloudinaryPublicId
      const artworkToDelete = artworks.find(a => a.id === id);
      const cloudinaryPublicId = artworkToDelete?.cloudinaryPublicId;

      // Delete from Cloudinary if there's a publicId
      if (cloudinaryPublicId) {
        try {
          await fetch(`/api/delete-image?publicId=${encodeURIComponent(cloudinaryPublicId)}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.error('Erreur suppression Cloudinary:', err);
          // Continue with deletion even if Cloudinary fails
        }
      }

      try {
        const response = await fetch('/api/artworks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artwork: { id }, action: 'delete', adminPassword: password }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }

        // Refresh artworks list
        await loadArtworks();
      } catch (err) {
        console.error('Erreur suppression:', err);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleStatus = async (artwork: Artwork) => {
    const statuses: Artwork['status'][] = ['available', 'sold', 'reserved'];
    const currentIndex = statuses.indexOf(artwork.status);
    const newStatus = statuses[(currentIndex + 1) % statuses.length];
    const updated = { ...artwork, status: newStatus };

    try {
      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artwork: updated, action: 'update', adminPassword: password }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // Refresh artworks list
      await loadArtworks();
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleTranslateExistingArtworks = async () => {
    setTranslatingArtworks(true);
    setTranslationNotice(null);
    try {
      const response = await fetch('/api/artworks/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: password }),
      });
      const data: { translated?: number; total?: number; error?: string } = await response.json();
      if (response.status === 503) {
        throw new Error('Ajoutez DEEPL_AUTH_KEY dans les variables Vercel pour activer les traductions.');
      }
      if (!response.ok) throw new Error(data.error || 'Impossible de traduire les œuvres.');
      setTranslationNotice(data.translated
        ? `${data.translated} œuvre(s) traduite(s) sur ${data.total}.`
        : 'Toutes les œuvres possèdent déjà leurs traductions.');
      await loadArtworks();
    } catch (error) {
      setTranslationNotice(error instanceof Error ? error.message : 'Impossible de traduire les œuvres.');
    } finally {
      setTranslatingArtworks(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-2xl p-8 lg:p-10 border border-zinc-100 dark:border-zinc-700 shadow-xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-white mb-2">
              Administration
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Espace de gestion des œuvres
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className={cn('relative', passwordError && 'animate-shake')}>
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe administrateur"
                className={cn(
                  'w-full px-4 py-3.5 rounded-xl border text-zinc-900 dark:text-white bg-white dark:bg-zinc-900',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
                  passwordError && 'border-red-400 dark:border-red-500'
                )}
                autoFocus
              />
              {passwordError && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-sm"
                >
                  Incorrect
                </motion.span>
              )}
            </div>

            <Button type="submit" className="w-full py-3.5 text-lg" size="lg">
              Accéder à l'administration
            </Button>
          </form>
        </motion.div>

        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:h-16">
            <h1 className="text-base sm:text-xl font-light tracking-wide leading-snug text-zinc-900 dark:text-white">
              Administration — Galerie de Jade Bourneuf
            </h1>
            <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
              <a href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                Voir le site
              </a>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <section className="mb-8 flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:p-6" aria-labelledby="maintenance-settings-title">
            <div>
              <h2 id="maintenance-settings-title" className="font-medium text-zinc-900 dark:text-white">
                Mode maintenance
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {maintenanceEnabled
                  ? 'Actif : les visiteurs devront saisir le mot de passe.'
                  : 'Inactif : la galerie est visible par tous.'}
              </p>
              {maintenanceError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                  {maintenanceError}
                </p>
              )}
            </div>
            <Button
              variant={maintenanceEnabled ? 'secondary' : 'primary'}
              onClick={handleToggleMaintenance}
              loading={maintenanceSaving}
              disabled={!maintenanceReady}
            >
              {maintenanceEnabled ? 'Désactiver la maintenance' : 'Activer la maintenance'}
            </Button>
          </section>

          <section className="mb-8 flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:p-6" aria-labelledby="translations-title">
            <div>
              <h2 id="translations-title" className="font-medium text-zinc-900 dark:text-white">
                Traductions automatiques
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Les textes des œuvres sont traduits en anglais et en allemand. Les nouvelles œuvres le seront lors de leur enregistrement.
              </p>
              {translationNotice && (
                <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300" role="status">
                  {translationNotice}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleTranslateExistingArtworks}
              loading={translatingArtworks}
              disabled={translatingArtworks || artworks.length === 0}
            >
              Traduire les œuvres existantes
            </Button>
          </section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
          >
            <div>
              <h2 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-white">
                Gestion des œuvres
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                {artworks.length} œuvre{artworks.length > 1 ? 's' : ''} au total
              </p>
            </div>
            <Button onClick={() => { setEditingArtwork(null); resetForm(); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
              Nouvelle œuvre
            </Button>
          </motion.div>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="mb-8"
            >
              <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 sm:p-6 lg:p-8 border border-zinc-100 dark:border-zinc-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                    {editingArtwork ? 'Modifier l\'œuvre' : 'Nouvelle œuvre'}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Titre *
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Description
                        </label>
                        <textarea
                          id="description"
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y"
                        />
                      </div>

                      <div>
                        <label htmlFor="image" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Image de l'œuvre *
                        </label>
                        <div className="space-y-3">
                          {imagePreview && (
                            <div className="relative group">
                              <img
                                src={imagePreview}
                                alt="Aperçu"
                                className="w-32 h-32 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                aria-label="Supprimer l'image"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          
                          {/* Mode tabs: Upload vs URL */}
                          <div className="flex gap-2 mb-2" role="tablist" aria-label="Mode d'ajout d'image">
                            <button
                              type="button"
                              role="tab"
                              aria-selected={imageInputMode === 'upload'}
                              onClick={() => setImageInputMode('upload')}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                imageInputMode === 'upload'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              role="tab"
                              aria-selected={imageInputMode === 'url'}
                              onClick={() => setImageInputMode('url')}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                imageInputMode === 'url'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              URL
                            </button>
                          </div>

                          {imageInputMode === 'upload' && (
                            <label className="flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors">
                              <input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                required={!editingArtwork && !imagePreview}
                              />
                              <div className="flex flex-col items-center gap-2 p-6 text-center">
                                <Upload className="w-10 h-10 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
                                <p className="text-zinc-600 dark:text-zinc-400">
                                  {imagePreview || editingArtwork ? 'Changer l\'image' : 'Glissez-déposez ou cliquez pour importer'}
                                </p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                  PNG, JPG, WebP · Max 10 Mo (Cloudinary)
                                </p>
                              </div>
                            </label>
                          )}

                          {imageInputMode === 'url' && (
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  value={imageUrl}
                                  onChange={e => setImageUrl(e.target.value)}
                                  placeholder="https://res.cloudinary.com/... ou https://..."
                                  className="min-w-0 flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                                <Button type="button" onClick={handleImageUrl} variant="primary">
                                  Ajouter
                                </Button>
                              </div>
                              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                                Collez une URL d\'image (Cloudinary, Imgur, etc.). Les URLs Cloudinary détecteront automatiquement le public_id.
                              </p>
                            </div>
                          )}

                          {!imagePreview && !editingArtwork && (
                            <p className="text-red-500 text-sm text-center">Une image est requise</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="width" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Largeur (cm) *
                          </label>
                          <input
                            id="width"
                            type="number"
                            min="1"
                            value={formData.width}
                            onChange={e => setFormData({ ...formData, width: parseInt(e.target.value) || 0 })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor="height" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Hauteur (cm) *
                          </label>
                          <input
                            id="height"
                            type="number"
                            min="1"
                            value={formData.height}
                            onChange={e => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="technique" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Technique *
                        </label>
                        <input
                          id="technique"
                          type="text"
                          value={formData.technique}
                          onChange={e => setFormData({ ...formData, technique: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Prix minimum / réserve (€) *
                          </label>
                          <input
                            id="price"
                            type="number"
                            min="1"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor="year" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Année *
                          </label>
                          <input
                            id="year"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            value={formData.year}
                            onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Statut *
                        </label>
                        <select
                          id="status"
                          value={formData.status}
                          onChange={e => setFormData({ ...formData, status: e.target.value as Artwork['status'] })}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        >
                          <option value="available">Disponible</option>
                          <option value="sold">Vendu</option>
                          <option value="reserved">Réservé</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Catégorie
                        </label>
                        <input
                          id="category"
                          type="text"
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          placeholder="Abstrait, Minimaliste, Expressionniste..."
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Tags (séparés par des virgules)
                        </label>
                        <input
                          id="tags"
                          type="text"
                          value={formData.tags}
                          onChange={e => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="lumière, matin, pastel..."
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {saveError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm" role="alert">
                      {saveError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Button type="button" variant="secondary" onClick={resetForm}>
                      Annuler
                    </Button>
                    <Button type="submit" loading={saving}>
                      <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                      {editingArtwork ? 'Mettre à jour' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          >
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-700">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Œuvre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hidden md:table-cell">Dimensions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">Technique</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Prix minimum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Statut</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                  {artworks.map((artwork, index) => (
                    <motion.tr
                      key={artwork.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700 flex-shrink-0">
                            <img
                              src={artwork.thumbnail || artwork.image}
                              alt={artwork.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">{artwork.title}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">#{artwork.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-zinc-600 dark:text-zinc-400 text-sm">
                        {artwork.width} × {artwork.height} cm
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell text-zinc-600 dark:text-zinc-400 text-sm">
                        {artwork.technique}
                      </td>
                      <td className="px-4 py-4 font-medium text-zinc-900 dark:text-white">
                        {artwork.price} €
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(artwork)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider',
                            artwork.status === 'available' && 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                            artwork.status === 'sold' && 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800',
                            artwork.status === 'reserved' && 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                          )}
                        >
                          {artwork.status === 'available' && 'Disponible'}
                          {artwork.status === 'sold' && 'Vendu'}
                          {artwork.status === 'reserved' && 'Réservé'}
                        </Button>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(artwork)} aria-label={`Modifier ${artwork.title}`}>
                            <Edit className="w-4 h-4" aria-hidden="true" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(artwork.id)} aria-label={`Supprimer ${artwork.title}`}>
                            <Trash2 className="w-4 h-4 text-red-500" aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {artworks.length === 0 && (
              <div className="p-12 text-center">
                <ImageIcon className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" aria-hidden="true" />
                <p className="text-zinc-500 dark:text-zinc-400">Aucune œuvre pour le moment</p>
                <Button className="mt-4" onClick={() => { setEditingArtwork(null); resetForm(); setShowForm(true); }}>
                  <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                  Ajouter la première œuvre
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
