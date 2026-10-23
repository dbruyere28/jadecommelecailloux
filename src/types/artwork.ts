export interface Artwork {
  id: string;
  title: string;
  description?: string;
  image: string;
  thumbnail?: string;
  width: number;
  height: number;
  depth?: number;
  technique: string;
  price: number;
  status: 'available' | 'sold' | 'reserved';
  year: number;
  category?: string;
  tags?: string[];
  featured?: boolean;
  cloudinaryPublicId?: string; // For Cloudinary image management
}

export interface ArtworkFormData {
  title: string;
  description: string;
  image: string;
  width: number;
  height: number;
  depth?: number;
  technique: string;
  price: number;
  status: 'available' | 'sold' | 'reserved';
  year: number;
  category?: string;
  tags: string; // comma-separated string for form input
  cloudinaryPublicId?: string; // Cloudinary public_id for uploaded images
}