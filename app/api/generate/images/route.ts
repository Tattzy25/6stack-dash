import { generateAndStoreImage, ImageMetadata } from '@/lib/image-storage';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      prompts,
      userEmail,
      licenseKey,
      model = 'stable-diffusion-v1-6',
      width = 512,
      height = 512,
      steps = 30,
      guidanceScale = 7.5,
    } = await request.json();

    // Validate required fields
    if (!prompts || !Array.isArray(prompts) || prompts.length === 0 || !userEmail || !licenseKey) {
      return NextResponse.json(
        { error: 'Missing required fields: prompts (array), userEmail, licenseKey' },
        { status: 400 }
      );
    }

    // Limit batch size
    if (prompts.length > 10) {
      return NextResponse.json(
        { error: 'Batch size limited to 10 images maximum' },
        { status: 400 }
      );
    }

    // TODO: Validate license key from database (unexpired, daily limit not exceeded)
    console.log(`🔑 Batch generation - License key used: ${licenseKey} by ${userEmail}, generating ${prompts.length} images`);

    const generatedImages: ImageMetadata[] = [];

    // Generate images sequentially to avoid rate limiting
    for (const prompt of prompts) {
      try {
        const imageMetadata = await generateAndStoreImage({
          prompt,
          model,
          userEmail,
          width,
          height,
          steps,
          guidanceScale,
        });

        generatedImages.push(imageMetadata);

        // Small delay between generations to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (singleImageError) {
        console.error(`Failed to generate image for prompt: "${prompt}"`, singleImageError);
        // Continue with other images instead of failing the entire batch
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      generated: generatedImages.length,
      totalRequested: prompts.length,
      images: generatedImages.map(img => ({
        id: img.id,
        url: img.blobUrl,
        prompt: img.prompt,
        model: img.model,
        width: img.width,
        height: img.height,
        createdAt: img.createdAt,
        tags: img.tags,
      }))
    });

  } catch (error) {
    console.error('Batch image generation failed:', error);

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
      { error: 'Batch image generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
