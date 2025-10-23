// =====================================================
// IMAGE STORAGE & RETRIEVAL SYSTEM
// Using Vercel Blob + Neon Database
// =====================================================

import { put } from '@vercel/blob';
import { sql } from '@/lib/database';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function calculateAspectRatio(width: number, height: number): string {
  // SD3.5 supports specific aspect ratios
  const supportedRatios = ["21:9", "16:9", "3:2", "5:4", "1:1", "4:5", "2:3", "9:16", "9:21"];

  // Calculate the ratio
  const ratio = width / height;
  const tolerance = 0.05; // 5% tolerance

  // Find the closest supported ratio
  for (const supportedRatio of supportedRatios) {
    const [w, h] = supportedRatio.split(':').map(Number);
    const supportedRatioValue = w / h;

    if (Math.abs(ratio - supportedRatioValue) <= tolerance) {
      return supportedRatio;
    }
  }

  // Default to 1:1 if no close match
  return "1:1";
}

export interface ImageMetadata {
  id: string;
  userEmail: string;
  prompt: string;
  negativePrompt?: string;
  model: string;
  width: number;
  height: number;
  steps: number;
  guidanceScale: number;
  blobUrl: string;
  fileSize: number;
  contentType: string;
  tags: string[];
  upscaledUrl?: string;
  createdAt: Date;
}

// =====================================================
// GENERATE & STORE IMAGE
// =====================================================

export async function generateAndStoreImage(params: {
  prompt: string;
  negativePrompt?: string;
  model: string;
  userEmail: string;
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
}) {
  try {
    // 1. Call Stability AI API (SD3.5 Large Turbo - most advanced model)
    const formData = new FormData();

    // Add the prompt
    formData.append('prompt', params.prompt);

    // Add negative prompt if provided
    if (params.negativePrompt) {
      formData.append('negative_prompt', params.negativePrompt);
    }

    // Use SD3.5 Large Turbo model (most advanced)
    formData.append('model', 'sd3.5-large-turbo');

    // Set aspect ratio based on dimensions (default to 1:1)
    const aspectRatio = calculateAspectRatio(params.width || 1024, params.height || 1024);
    formData.append('aspect_ratio', aspectRatio);

    // Seed for reproducibility (0 = random)
    formData.append('seed', '0');

    // Output format
    formData.append('output_format', 'png');

    const stabilityResponse = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Accept': 'image/*',
      },
      body: formData,
    });

    if (!stabilityResponse.ok) {
      const errorText = await stabilityResponse.text();
      console.error('Stability AI API error:', stabilityResponse.status, errorText);

      // Check for specific error types
      if (stabilityResponse.status === 402) {
        throw new Error('Stability AI credits exhausted or invalid API key');
      } else if (stabilityResponse.status === 403) {
        throw new Error('Forbidden: Check API key permissions');
      } else if (stabilityResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before generating more images');
      }

      throw new Error(`Stability AI API request failed: ${stabilityResponse.status} ${errorText}`);
    }

    // Check finish reason for content filtering
    const finishReason = stabilityResponse.headers.get('finish-reason');
    if (finishReason === 'CONTENT_FILTERED') {
      throw new Error('Image generation was filtered due to content policy. Please try a different prompt.');
    }

    // Get generated seed for reference
    const generatedSeed = stabilityResponse.headers.get('seed');

    // Get the image data directly (new API returns image data directly)
    const imageBuffer = await stabilityResponse.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // 2. Upload to Vercel Blob
    const filename = `tattoo-${generatedSeed || Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
    const blob = new Blob([buffer], { type: 'image/png' });

    // Upload to Vercel Blob
    const { url: blobUrl } = await put(filename, blob, {
      access: 'public',
      contentType: 'image/png',
    });

    if (!blobUrl) {
      throw new Error('Failed to upload image to Blob storage');
    }

    // 3. Store metadata in Neon database
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

    await sql`
      INSERT INTO generation_assets (
        id,
        user_email,
        prompt,
        negative_prompt,
        model,
        width,
        height,
        steps,
        guidance_scale,
        blob_url,
        file_size,
        content_type,
        tags,
        created_at
      ) VALUES (
        ${imageId},
        ${params.userEmail},
        ${params.prompt},
        ${params.negativePrompt || null},
        ${params.model},
        ${params.width || 512},
        ${params.height || 512},
        ${params.steps || 50},
        ${params.guidanceScale || 7},
        ${blobUrl},
        ${buffer.length},
        'image/png',
        ARRAY['tattoo', 'generated'],
        NOW()
      )
    `;

    // 4. Return complete image metadata
    const metadata: ImageMetadata = {
      id: imageId,
      userEmail: params.userEmail,
      prompt: params.prompt,
      negativePrompt: params.negativePrompt,
      model: params.model,
      width: params.width || 512,
      height: params.height || 512,
      steps: params.steps || 50,
      guidanceScale: params.guidanceScale || 7,
      blobUrl,
      fileSize: buffer.length,
      contentType: 'image/png',
      tags: ['tattoo', 'generated'],
      createdAt: new Date(),
    };

    return metadata;

  } catch (error) {
    console.error('Image generation and storage failed:', error);
    throw error;
  }
}

// =====================================================
// UPSCALING FEATURE
// =====================================================

export async function upscaleImage(imageId: string, scale: number = 2) {
  try {
    // 1. Get original image metadata
    const [imageResult] = await sql`
      SELECT * FROM generation_assets WHERE id = ${imageId}
    `;

    if (!imageResult) {
      throw new Error('Original image not found');
    }

    // 2. Call Stability AI upscaling API
    const upscaleResponse = await fetch('https://api.stability.ai/v1/generation/esrgan-v1-x2plus/image-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
      },
      body: new FormData(),
      // Note: You'd need to fetch the original image from Blob and send it to the upscaling API
    });

    if (!upscaleResponse.ok) {
      throw new Error('Upscaling request failed');
    }

    // 3. Upload upscaled image to Blob
    const upscaledFilename = `tattoo-upscaled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
    // ... upload logic ...

    // 4. Update database with upscaled URL
    await sql`
      UPDATE generation_assets
      SET upscaled_url = ${'upscaled_blob_url_here'},
          updated_at = NOW()
      WHERE id = ${imageId}
    `;

    return { success: true, upscaledUrl: 'upscaled_blob_url_here' };

  } catch (error) {
    console.error('Upscaling failed:', error);
    throw error;
  }
}

// =====================================================
// RETRIEVE IMAGES
// =====================================================

export async function getUserImages(email: string, limit: number = 20) {
  try {
    const images = await sql`
      SELECT id, prompt, blob_url, upscaled_url, created_at, tags
      FROM generation_assets
      WHERE user_email = ${email}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return images.map(img => ({
      id: img.id,
      prompt: img.prompt,
      blobUrl: img.blob_url,
      upscaledUrl: img.upscaled_url,
      createdAt: img.created_at,
      tags: img.tags as string[]
    }));

  } catch (error) {
    console.error('Failed to retrieve user images:', error);
    throw error;
  }
}

// =====================================================
// CLEANUP SYSTEM (Optional)
// =====================================================

export async function cleanupOldImages(daysOld: number = 30) {
  try {
    // Find images older than X days
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const oldImages = await sql`
      SELECT id, blob_url
      FROM generation_assets
      WHERE created_at < ${cutoffDate}
      AND upscaled_url IS NULL
    `;

    // TODO: Implement Blob deletion
    // Note: Vercel Blob doesn't have easy bulk delete, may need individual calls

    // Update database (mark as deleted or add cleanup date)
    await sql`
      UPDATE generation_assets
      SET tags = array_append(tags, 'marked_for_deletion'),
          updated_at = NOW()
      WHERE created_at < ${cutoffDate}
    `;

    return { imagesMarked: oldImages.length };

  } catch (error) {
    console.error('Cleanup failed:', error);
    throw error;
  }
}

// =====================================================
// DATABASE TABLES REQUIRED
// =====================================================

export const imageStorageTablesSQL = `
-- Table for storing generated image metadata and Blob URLs
CREATE TABLE IF NOT EXISTS generation_assets (
    id VARCHAR(255) PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    model VARCHAR(100) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    steps INTEGER NOT NULL,
    guidance_scale DECIMAL(3,1) NOT NULL,
    blob_url TEXT NOT NULL,
    upscaled_url TEXT,
    file_size INTEGER NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_generation_assets_email ON generation_assets(user_email);
CREATE INDEX IF NOT EXISTS idx_generation_assets_created ON generation_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_assets_tags ON generation_assets USING GIN(tags);
`;
