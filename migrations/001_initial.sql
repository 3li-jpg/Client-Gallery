CREATE TABLE IF NOT EXISTS galleries (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  access_code TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_accessed TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY,
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  size_bytes BIGINT,
  width INTEGER,
  height INTEGER,
  blur_data_url TEXT,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS galleries_slug_idx ON galleries (slug);
CREATE INDEX IF NOT EXISTS photos_gallery_id_idx ON photos (gallery_id);
CREATE INDEX IF NOT EXISTS photos_gallery_filename_idx ON photos (gallery_id, filename);
