export interface UserRecord {
  id: string;
  name: string;
  email: string;
  email_verified: string | null;
  image: string | null;
  password_hash: string | null;
  stripe_customer_id: string | null;
  plan: string;
  storage_used_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryRecord {
  id: string;
  slug: string;
  name: string;
  client_name: string;
  access_code: string;
  user_id: string | null;
  created_at: string;
  last_accessed: string | null;
}

export interface GalleryListItem extends GalleryRecord {
  photo_count: number;
}

export interface PhotoRecord {
  id: string;
  gallery_id: string;
  filename: string;
  r2_key: string;
  content_type: string;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  blur_data_url: string | null;
  uploaded_at: string;
}
