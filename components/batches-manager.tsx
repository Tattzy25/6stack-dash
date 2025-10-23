"use client"

import { useState } from "react"
import { PromptsGenerator } from "@/components/prompts-generator"
import { ImagesGenerator } from "@/components/images-generator"
import { ImageSelector } from "@/components/image-selector"
import { VerifiedImages } from "@/components/verified-images"
import { UploadedImages } from "@/components/uploaded-images"
import { ErrorBoundary } from "@/components/error-boundary"
import type { GeneratedImage } from "@/hooks/use-images"

interface UserContext {
  email: string
  licenseKey: string
}

export function BatchesManager() {
  const [userContext] = useState<UserContext>({
    email: 'studio@tattoo-app.com', // TODO: Get from actual user context/authentication
    licenseKey: 'license-key-placeholder' // TODO: Get from license management system
  })

  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)

  const handleImagesGenerated = (images: string[]) => {
    // This callback is for compatibility, but we primarily use the hooks in individual components
    console.log(`${images.length} images were generated`)
  }

  const handleGenerationStart = (isGenerating: boolean) => {
    setIsGeneratingImages(isGenerating)
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Content Generation Studio</h1>
          <p className="text-muted-foreground text-lg">
            Generate prompts and images using advanced AI models, then manage your verified content library.
          </p>
        </div>

        {/* Prompts Generator Section */}
        <PromptsGenerator />

        {/* Images Generator Section */}
        <ImagesGenerator
          onImagesGenerated={handleImagesGenerated}
        />

        {/* Image Selection Section */}
        <ImageSelector
          generatedImages={generatedImages}
          isGenerating={isGeneratingImages}
        />

        {/* Verified Images Section */}
        <VerifiedImages
          userEmail={userContext.email}
          licenseKey={userContext.licenseKey}
        />

        {/* Uploaded Images Section */}
        <UploadedImages
          userEmail={userContext.email}
        />
      </div>
    </ErrorBoundary>
  )
}
