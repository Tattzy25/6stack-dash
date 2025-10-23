import { sql } from './lib/database.js'

try {
  await sql`
    CREATE TABLE IF NOT EXISTS uploaded_images (
      id VARCHAR(255) PRIMARY KEY,
      blob_url TEXT NOT NULL,
      filename VARCHAR(255) NOT NULL,
      size INTEGER NOT NULL,
      type VARCHAR(50) NOT NULL,
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_uploaded_images_created_at ON uploaded_images(created_at DESC)`

  console.log('✅ uploaded_images table created successfully!')
} catch (error) {
  console.error('❌ Failed to create table:', error)
}
