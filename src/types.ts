/**
 * Shared Type Definitions for Ryan CNC Website
 */

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: 'Medical Parts' | 'Automotive Parts' | 'Special/Custom Parts' | string;
  imageUrl: string;
  specifications: string; // Detail about materials, tolerance, dimensions, etc.
  createdAt: string;
}

export interface Machine {
  id: string;
  model: string;
  year: string;
  specifications: string; // List of specs (comma separated or multi-line text)
  price: string;
  imageUrl: string;
  status: 'available' | 'sold';
  createdAt: string;
}

export interface WorkshopSettings {
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  tagline?: string;
  description?: string;
  adminPasscode?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  itemType?: 'general' | 'part' | 'machine';
  itemName?: string; // e.g. "Citizen Cincom L20 VII" or "Medical Bone Screw"
  createdAt: string;
}


