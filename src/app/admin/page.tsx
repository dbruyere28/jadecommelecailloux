'use client';

import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, Plus, Save, X, Loader2, Image as ImageIcon, Hash, Upload, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { artworks } from '@/data/artworks';
import { Artwork, ArtworkFormData } from '@/types/artwork';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'artworks_catalog';
const DELETED_KEY = 'artworks_deleted';
const ADMIN_PASSWORD = 'galerie2024';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
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
  const [localArtworks, setLocalArtworks] = useState<Artwork[]>([]);
  const [deletedStaticIds, setDeletedStaticIds] = useState<string[]>([]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, year: new Date().getFullYear() }));
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setLocalArtworks(JSON.parse(stored));
      } catch {
        setLocalArtworks([]);
      }
    }
    const deleted = localStorage.getItem(DELETED_KEY);
    if (deleted) {
      try {
        setDeletedStaticIds(JSON.parse(deleted));
      } catch {
        setDeletedStaticIds([]);
      }
    }
  }, []);

  const allArtworks = [
    ...artworks.filter(a => !deletedStaticIds.includes(a.id)),
    ...localArtworks.filter(a => !artworks.some(oa => oa.id === a.id))
  ];

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
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
      year: new Date().getFullYear(),
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

    const newArtwork: Artwork = {
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

    const updatedArtworks = editingArtwork
      ? localArtworks.map(a => a.id === editingArtwork.id ? newArtwork : a)
      : [newArtwork, ...localArtworks];

    try {
      setLocalArtworks(updatedArtworks);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedArtworks));
      
      // Dispatch storage event for other tabs/pages
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
      
      resetForm();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        setSaveError('L\'image est trop volumineuse pour le stockage local. Réduisez la taille de l\'image (max ~1-2 Mo recommandé).');
      } else {
        setSaveError('Erreur lors de la sauvegarde. Réessayez.');
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
      const artworkToDelete = allArtworks.find(a => a.id === id);
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

      const isStatic = artworks.some(a => a.id === id);
      if (isStatic) {
        // Mark static artwork as deleted
        setDeletedStaticIds(prev => {
          const updated = [...prev, id];
          localStorage.setItem(DELETED_KEY, JSON.stringify(updated));
          window.dispatchEvent(new StorageEvent('storage', { key: DELETED_KEY }));
          return updated;
        });
      } else {
        // Remove from localStorage artworks
        const updated = localArtworks.filter(a => a.id !== id);
        setLocalArtworks(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
      }
    }
  };

  const handleToggleStatus = (artwork: Artwork) => {
    const statuses: Artwork['status'][] = ['available', 'sold', 'reserved'];
    const currentIndex = statuses.indexOf(artwork.status);
    const newStatus = statuses[(currentIndex + 1) % statuses.length];
    const updated = { ...artwork, status: newStatus };

    const isStatic = artworks.some(a => a.id === artwork.id);
    if (isStatic) {
      // Create a local copy with updated status (overrides static)
      const updatedList = localArtworks.find(a => a.id === artwork.id)
        ? localArtworks.map(a => a.id === artwork.id ? updated : a)
        : [updated, ...localArtworks];
      setLocalArtworks(updatedList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    } else {
      const updatedList = localArtworks.map(a => a.id === artwork.id ? updated : a);
      setLocalArtworks(updatedList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
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
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-light tracking-wide text-zinc-900 dark:text-white">
              Administration — Galerie de Jade Bourneuf
            </h1>
            <div className="flex items-center gap-4">
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

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
                {allArtworks.length} œuvre{allArtworks.length > 1 ? 's' : ''} au total
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
              <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 lg:p-8 border border-zinc-100 dark:border-zinc-700 shadow-sm">
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
                                  className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                            Prix (€) *
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
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Prix</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Statut</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                  {allArtworks.map((artwork, index) => (
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

            {allArtworks.length === 0 && (
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