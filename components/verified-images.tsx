"use client"

import React, { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Upload, RefreshCw, CheckCircle, FileImage, Search, Grid, List } from "lucide-react"
import { useVerifiedImages } from "@/hooks/use-verified-images"
import { useUploadedImages } from "@/hooks/use-uploaded-images"
import { ErrorBoundary } from "@/components/error-boundary"

interface VerifiedImagesProps {
  userEmail?: string
  licenseKey?: string
}

export function VerifiedImages({ userEmail = 'user@tattoo-studio.com', licenseKey = 'license-key-placeholder' }: VerifiedImagesProps) {
  const {
    verifiedImages,
    isUploading,
    uploadProgress,
    uploadBulkFiles,
    addVerifiedImages,
    error
  } = useVerifiedImages()

  const {
    uploadedImages: storedImages,
    isLoading,
    refreshImages,
    getStorageStats,
    error: fetchError
  } = useUploadedImages(userEmail)

  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')

  // Refresh uploaded images when component mounts
  useEffect(() => {
    refreshImages()
  }, [refreshImages])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    // Filter for image files only
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setSelectedFiles(imageFiles)
  }

  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) return

    await uploadBulkFiles(selectedFiles, userEmail, licenseKey)
    setSelectedFiles([])

    // Reset file input
    const fileInput = document.getElementById('bulk-file-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''

    // Refresh the stored images list
    await refreshImages()
  }

  const filteredImages = verifiedImages.filter(img =>
    !searchQuery ||
    img.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalImages = verifiedImages.length + storedImages.length
  const storageStats = getStorageStats()

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Verified Photos Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Verified Photos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card - Upload & Management */}
            <Card>
              <CardHeader>
                <CardTitle>Manual Image Upload</CardTitle>
                <CardDescription>Upload existing images to the verified collection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Image Files</Label>

                  {selectedFiles.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <p>{selectedFiles.length} image(s) selected</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedFiles.slice(0, 3).map((file, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {file.name}
                          </Badge>
                        ))}
                        {selectedFiles.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{selectedFiles.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Input
                      id="bulk-file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="cursor-pointer file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <Button
                      onClick={handleBulkUpload}
                      disabled={selectedFiles.length === 0 || isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Uploading Files...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload {selectedFiles.length || ''} Selected Files
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Bulk Upload Progress */}
                  {isUploading && (
                    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">{uploadProgress.uploaded}</Badge>
                          <span className="text-muted-foreground">/</span>
                          <Badge>{uploadProgress.total}</Badge>
                        </div>
                        <span className="text-muted-foreground">files uploaded</span>
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
                        Processing and uploading to Vercel Blob + Neon...
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Storage Statistics */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Collection Statistics</Label>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalImages}</div>
                      <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Total Images</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {storageStats.storageUsed}
                      </div>
                      <div className="text-xs text-green-600/70 dark:text-green-400/70">Storage Used</div>
                    </div>
                  </div>
                </div>

                {/* Error Handling */}
                {(error || fetchError) && (
                  <div className="flex items-start space-x-2 rounded-md border border-red-200 bg-red-50 p-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-800">
                      {error || fetchError}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Images are uploaded to Vercel Blob for permanent storage</p>
                  <p>• Metadata is stored in Neon database for search/filtering</p>
                  <p>• All files get CDN URLs for fast worldwide access</p>
                </div>
              </CardContent>
            </Card>

            {/* Right Card - Verified Images Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Verified Images Collection</CardTitle>
                <CardDescription>
                  {totalImages > 0
                    ? `${totalImages} verified images in permanent storage`
                    : "Verified images will appear here after upload"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and View Controls */}
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search images..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => refreshImages()}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => setViewMode('grid')}
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setViewMode('list')}
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Images Display */}
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading verified images...</p>
                  </div>
                ) : totalImages > 0 ? (
                  <>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                        {/* Show both verified images (from memory) and stored images (from database) */}
                        {[...verifiedImages, ...storedImages.filter(img =>
                          !verifiedImages.some(v => v.id === img.id)
                        )].map((image, index) => (
                          <div key={image.id || index} className="relative bg-muted rounded-lg overflow-hidden">
                            <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center">
                              <div className="text-center p-2">
                                <FileImage className="h-6 w-6 mx-auto mb-1 text-green-700 dark:text-green-300" />
                                <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                                  {image.filename || `Verified ${index + 1}`}
                                </span>
                              </div>
                            </div>
                            <div className="absolute top-1 left-1">
                              <Badge variant="outline" className="text-[8px] h-4 px-1 bg-white/90">
                                ☁️ Stored
                              </Badge>
                            </div>
                            <div className="absolute bottom-1 right-1">
                              <Badge variant="secondary" className="text-[8px] h-4 px-1">
                                ✓ Verified
                              </Badge>
                            </div>
                            {image.size && (
                              <div className="absolute top-1 right-1">
                                <Badge variant="secondary" className="text-[8px] h-4 px-1">
                                  {(image.size / 1024).toFixed(0)}KB
                                </Badge>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {[...verifiedImages, ...storedImages.filter(img =>
                          !verifiedImages.some(v => v.id === img.id)
                        )].map((image, index) => (
                          <div key={image.id || index} className="flex items-center space-x-3 p-3 rounded-lg border">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center flex-shrink-0">
                              <FileImage className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {image.filename || `Verified Image ${index + 1}`}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{image.size ? `${(image.size / 1024).toFixed(0)}KB` : 'Size unknown'}</span>
                                <span>•</span>
                                <span>{image.createdAt ? new Date(image.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Badge variant="secondary" className="text-xs">
                                ✓ Verified
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                ☁️ Stored
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchQuery && filteredImages.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>No images match your search.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileImage className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No verified images yet.</p>
                    <p className="text-sm">Upload images above or generate and select them to add to your collection.</p>
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
