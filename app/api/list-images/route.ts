import { sql } from "@/lib/database"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch uploaded images from uploaded_images table
    const imagesResult = await sql`
      SELECT
        id,
        blob_url,
        filename,
        size,
        type,
        tags,
        created_at
      FROM uploaded_images
      WHERE blob_url IS NOT NULL
        AND blob_url != ''
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    return NextResponse.json({
      success: true,
      images: imagesResult
    })

  } catch (error) {
    console.error('Failed to fetch uploaded images:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
