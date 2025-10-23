import { generateAndStoreImage, ImageMetadata } from '@/lib/image-storage';
import { NextRequest, NextResponse } from 'next/server';

// API route for generating and storing tattoo images
export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      negativePrompt,
      model = 'stable-diffusion-v1-6',
      userEmail,
      licenseKey,
      width = 512,
      height = 512,
      steps = 30,
      guidanceScale = 7.5,
    } = await request.json();

    // Validate required fields
    if (!prompt || !userEmail || !licenseKey) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, userEmail, licenseKey' },
        { status: 400 }
      );
    }

    // TODO: Validate license key from database (unexpired, daily limit not exceeded)
    // For now, just log the license key
    console.log(`🔑 License key used: ${licenseKey} by ${userEmail}`);

    // Generate image using Stability AI + store in Vercel Blob + save metadata in Neon
    const imageMetadata = await generateAndStoreImage({
      prompt,
      negativePrompt,
      model,
      userEmail,
      width,
      height,
      steps,
      guidanceScale,
    });

    // Return success response with metadata and immediate image URL
    return NextResponse.json({
      success: true,
      image: {
        id: imageMetadata.id,
        url: imageMetadata.blobUrl, // This is the Vercel Blob URL for immediate display
        upscaledUrl: imageMetadata.upscaledUrl,
        prompt: imageMetadata.prompt,
        model: imageMetadata.model,
        width: imageMetadata.width,
        height: imageMetadata.height,
        steps: imageMetadata.steps,
        guidanceScale: imageMetadata.guidanceScale,
        createdAt: imageMetadata.createdAt,
        tags: imageMetadata.tags,
      }
    });

  } catch (error) {
    console.error('Image generation failed:', error);

    // Determine appropriate error response based on error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    if (errorMessage.includes('Stability API')) {
      return NextResponse.json(
        { error: 'Generation service temporarily unavailable' },
        { status: 503 }
      );
    }

    if (errorMessage.includes('license') || errorMessage.includes('expired')) {
      return NextResponse.json(
        { error: 'Invalid or expired license key' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Image generation failed. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's previous generations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // TODO: Import and use getUserImages function
    // const userImages = await getUserImages(userEmail, limit);

    return NextResponse.json({
      success: true,
      images: [], // Placeholder - implement getUserImages
      limit,
      userEmail
    });

  } catch (error) {
    console.error('Failed to retrieve images:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve images' },
      { status: 500 }
    );
  }
}
