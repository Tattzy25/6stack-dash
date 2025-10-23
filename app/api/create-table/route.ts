import { sql } from "@/lib/database"
import { NextResponse } from "next/server"

export async function GET() {
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

    return NextResponse.json({
      success: true,
      message: 'uploaded_images table created successfully!'
    })

  } catch (error) {
    console.error('Failed to create table:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
