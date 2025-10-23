"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Check, Upload, RefreshCw, CheckCircle } from "lucide-react"
import { useImageSelection } from "@/hooks/use-image-selection"
import { useVerifiedImages } from "@/hooks/use-verified-images"
import { ErrorBoundary } from "@/components/error-boundary"
import type { GeneratedImage } from "@/hooks/use-images"

interface ImageSelectorProps {
  generatedImages: GeneratedImage[]
  isGenerating?: boolean
}

export function ImageSelector({ generatedImages, isGenerating }: ImageSelectorProps) {
  const {
    selectedImages,
    selectImage,
    hasSelections,
    getSelectedCount,
    deselectAll,
    selectAll
  } = useImageSelection()

  const {
    verifiedImages,
    isUploading,
    uploadProgress,
    uploadSelectedImages,
    error
  } = useVerifiedImages()

  // Auto-deselect images when new batch is generated
  useEffect(() => {
    if (generatedImages.length > 0 && !isGenerating) {
      deselectAll()
    }
  }, [generatedImages, isGenerating, deselectAll])

  const handleSelectAll = () => {
    if (generatedImages.length === selectedImages.size) {
      deselectAll()
    } else {
      selectAll(generatedImages.map(img => img.url))
    }
  }

  const handleUploadSelected = async () => {
    if (selectedImages.size === 0 || !hasSelections()) return

    const selectedArray = Array.from(selectedImages)
    await uploadSelectedImages(
      selectedArray,
      'user@tattoo-studio.com', // TODO: Get from user context
      'license-key-placeholder' // TODO: Get from license context
    )
  }

  const selectedCount = getSelectedCount()
  const totalGenerated = generatedImages.length
  const allSelected = totalGenerated > 0 && selectedCount === totalGenerated

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Image Selection Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Image Selection</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card - Generated Images Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Images Gallery</CardTitle>
                <CardDescription>
                  {selectedCount > 0
                    ? `Select images to upload to verified collection (${selectedCount} selected)`
                    : "Select images to upload to verified collection"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedImages.length > 0 ? (
                  <>
                    {/* Selection Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleSelectAll}
                          variant={allSelected ? "default" : "outline"}
                          size="sm"
                          disabled={totalGenerated === 0}
                        >
                          {allSelected ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              All Selected
                            </>
                          ) : (
                            `Select All (${totalGenerated})`
                          )}
                        </Button>
                        {selectedCount > 0 && (
                          <Button
                            onClick={deselectAll}
                            variant="outline"
                            size="sm"
                          >
                            Deselect All
                          </Button>
                        )}
                      </div>
                      {selectedCount > 0 && (
                        <Button
                          onClick={handleUploadSelected}
                          disabled={isUploading}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isUploading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Selected ({selectedCount})
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Images Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                      {generatedImages.map((image, index) => (
                        <div
                          key={image.id}
                          onClick={() => selectImage(image.url)}
                          className={`relative bg-muted rounded-lg overflow-hidden cursor-pointer transition-all ${
                            selectedImages.has(image.url)
                              ? 'ring-2 ring-primary ring-offset-2'
                              : 'hover:ring-1 hover:ring-primary/50'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={`Generated tattoo ${index + 1}`}
                            className="w-full aspect-square object-cover"
                            loading="lazy"
                          />
                          {selectedImages.has(image.url) && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="bg-primary rounded-full p-1">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-1 right-1">
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">
                              {index + 1}
                            </Badge>
                          </div>
                          <div className="absolute bottom-1 left-1">
                            <Badge variant={selectedImages.has(image.url) ? "default" : "outline"} className="text-[10px] h-4 px-1">
                              {selectedImages.has(image.url) ? "✓" : "○"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">{uploadProgress.uploaded}</Badge>
                            <span className="text-muted-foreground">/</span>
                            <Badge>{uploadProgress.total}</Badge>
                          </div>
                          <span className="text-muted-foreground">images uploaded</span>
                        </div>

                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: uploadProgress.total > 0 ? `${Math.round((uploadProgress.uploaded / uploadProgress.total) * 100)}%` : '0%'
                            }}
                          />
                        </div>

                        <div className="text-sm text-muted-foreground text-center">
                          Uploading to Vercel Blob + Neon database...
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 rounded-md border border-red-200 bg-red-50">
                        <div className="text-sm text-red-800">
                          Upload error: {error}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No images generated yet.</p>
                    <p className="text-sm">Generate images above to select and verify them.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Card - Upload Progress & Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Progress & Statistics</CardTitle>
                <CardDescription>Track verified images and upload statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selection Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalGenerated}</div>
                    <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Generated</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedCount}</div>
                    <div className="text-xs text-green-600/70 dark:text-green-400/70">Selected</div>
                  </div>
                </div>

                <Separator />

                {/* Verified Images Count */}
                <div className="space-y-2">
                  <Label>Verified Images Collection</Label>
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {verifiedImages.length}
                    </div>
                    <div className="text-sm text-green-600/70 dark:text-green-400/70">
                      Total Verified Images
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Instructions */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p>Click on generated images to select them for verification</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <p>Selected images will be uploaded to permanent storage</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                    <p>Upload process stores images in Vercel Blob + metadata in Neon</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                    <p>All verified images get permanent CDN URLs for fast access</p>
                  </div>
                </div>

                {selectedCount === 0 && totalGenerated > 0 && (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 Tip: Click on the generated images to select them for upload to your verified collection.
                    </p>
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
