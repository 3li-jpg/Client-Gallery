export interface GalleryRecord {
  id: string;
  slug: string;
  name: string;
  client_name: string;
  access_code: string;
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
