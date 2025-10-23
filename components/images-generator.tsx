"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { useImages } from "@/hooks/use-images"
import { ErrorBoundary } from "@/components/error-boundary"

interface ImagesGeneratorProps {
  onImagesGenerated?: (images: string[]) => void
}

export function ImagesGenerator({ onImagesGenerated }: ImagesGeneratorProps) {
  const {
    config,
    updateConfig,
    isGenerating,
    progress,
    generatedImages,
    realGeneratedImages,
    error,
    generateBatchImages
  } = useImages()

  const handleProviderChange = (value: string) => {
    updateConfig({ provider: value })
  }

  const handleModelChange = (value: string) => {
    updateConfig({ model: value })
  }

  const handleApiKeyChange = (value: string) => {
    updateConfig({ apiKey: value })
  }

  const handleUserEmailChange = (value: string) => {
    updateConfig({ userEmail: value })
  }

  const handleLicenseKeyChange = (value: string) => {
    updateConfig({ licenseKey: value })
  }

  const handlePromptChange = (value: string) => {
    updateConfig({ prompt: value })
  }

  const handleGenerateBatch = async (count: number = 5) => {
    // For now, generate images using the same prompt multiple times
    // In the future, this could be integrated with prompt generation
    if (!config.prompt.trim()) {
      return
    }

    const prompts = Array(count).fill(config.prompt.trim())
    await generateBatchImages(prompts, count)

    // Notify parent component
    if (onImagesGenerated && realGeneratedImages.length > 0) {
      onImagesGenerated(generatedImages)
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Image Generation Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Image Generation</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card - Image Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Stability AI Image Generation</CardTitle>
                <CardDescription>Configure SD3.5 Large Turbo for high-quality image generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Provider Settings */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="imageProvider">Provider</Label>
                    <Select value={config.provider} onValueChange={handleProviderChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stability">Stability AI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="imageModel">Model</Label>
                    <Select value={config.model} onValueChange={handleModelChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sd3.5-large-turbo">SD3.5 Large Turbo</SelectItem>
                        <SelectItem value="stable-diffusion-xl">Stable Diffusion XL</SelectItem>
                        <SelectItem value="stable-diffusion-2">Stable Diffusion 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="imageApiKey">API Key</Label>
                    <Input
                      id="imageApiKey"
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder="Enter your Stability API key"
                    />
                  </div>

                  <div>
                    <Label htmlFor="userEmail">User Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={config.userEmail}
                      onChange={(e) => handleUserEmailChange(e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="licenseKey">License Key</Label>
                    <Input
                      id="licenseKey"
                      type="password"
                      value={config.licenseKey}
                      onChange={(e) => handleLicenseKeyChange(e.target.value)}
                      placeholder="Enter your license key"
                    />
                  </div>
                </div>

                <Separator />

                {/* Image Prompt */}
                <div>
                  <Label htmlFor="imagePrompt">Image Prompt</Label>
                  <Textarea
                    id="imagePrompt"
                    value={config.prompt}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    placeholder="Describe the tattoo image to generate... (e.g., 'intricate rose tattoo on forearm, black and gray realism, detailed shading')"
                    className="min-h-[100px] resize-y"
                  />
                </div>

                {error && (
                  <div className="flex items-start space-x-2 rounded-md border border-red-200 bg-red-50 p-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-800">
                      {error}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Generate Batch</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleGenerateBatch(1)}
                      disabled={isGenerating || !config.prompt.trim()}
                      variant="outline"
                      className="flex-1"
                    >
                      1 Image
                    </Button>
                    <Button
                      onClick={() => handleGenerateBatch(3)}
                      disabled={isGenerating || !config.prompt.trim()}
                      variant="outline"
                      className="flex-1"
                    >
                      3 Images
                    </Button>
                    <Button
                      onClick={() => handleGenerateBatch(5)}
                      disabled={isGenerating || !config.prompt.trim()}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "5 Images"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Card - Image Generation Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Image Generation Progress</CardTitle>
                <CardDescription>Visual state of batch image generation using SD3.5 Large Turbo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline">{progress.created}</Badge>
                        <span className="text-sm text-muted-foreground">/</span>
                        <Badge>{progress.total}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">images generated</span>
                    </div>
                    {isGenerating && (
                      <Badge variant="default" className="animate-pulse">
                        Generating...
                      </Badge>
                    )}
                  </div>

                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: progress.total > 0 ? `${Math.round((progress.created / progress.total) * 100)}%` : '0%'
                      }}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {progress.created} of {progress.total} completed
                    {isGenerating && ` (${Math.round((progress.created / progress.total) * 100)}%)`}
                  </div>
                </div>

                <Separator />

                {/* Generated Images Grid */}
                <div className="space-y-2">
                  <Label>Generated Images ({realGeneratedImages.length})</Label>
                  {realGeneratedImages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {realGeneratedImages.map((image, index) => (
                        <div key={image.id} className="relative bg-muted rounded-lg overflow-hidden">
                          <img
                            src={image.url}
                            alt={`Generated tattoo ${index + 1}`}
                            className="w-full h-32 object-cover"
                            loading="lazy"
                          />
                          <div className="absolute bottom-2 right-2">
                            <Badge variant="secondary" className="text-xs bg-green-600">
                              ✓ Generated
                            </Badge>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="outline" className="text-xs">
                              SD3.5
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">
                        {isGenerating ? "Generating high-quality tattoo images..." : "Generated images will appear here"}
                      </span>
                    </div>
                  )}
                </div>

                {realGeneratedImages.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• All images generated with SD3.5 Large Turbo (latest model)</p>
                    <p>• Automatically stored in Vercel Blob + Neon database</p>
                    <p>• High-resolution output with optimized aspect ratios</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
