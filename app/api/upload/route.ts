import { put } from '@vercel/blob'
import { sql } from "@/lib/database"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const filename = formData.get('filename') as string
    const userEmail = formData.get('userEmail') as string

    if (!file || !filename || !userEmail) {
      return NextResponse.json(
        { error: 'Missing file, filename, or userEmail' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = filename.split('.').pop() || 'png'
    const fileName = `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`

    // Upload to Vercel Blob
    const { url: blobUrl } = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
    })

    if (!blobUrl) {
      throw new Error('Failed to upload image to Blob storage')
    }

    // Generate UUID for the image
    const imageId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`

    // Store metadata in uploaded_images table
    await sql`
      INSERT INTO uploaded_images (id, blob_url, filename, size, type, tags)
      VALUES (${imageId}, ${blobUrl}, ${filename}, ${file.size}, ${file.type}, ARRAY['uploaded', 'manual'])
    `

    return NextResponse.json({
      success: true,
      image: {
        id: imageId,
        blobUrl,
        filename,
        size: file.size,
        type: file.type,
        createdAt: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error('Upload failed:', error)

    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
