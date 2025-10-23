-- Create table for manually uploaded images
CREATE TABLE IF NOT EXISTS uploaded_images (
    id VARCHAR(255) PRIMARY KEY,
    blob_url TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    size INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_uploaded_images_created_at ON uploaded_images(created_at DESC);
