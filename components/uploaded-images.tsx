"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, RefreshCw, Database, Cloud, Search, Download } from "lucide-react"
import { useUploadedImages } from "@/hooks/use-uploaded-images"
import { ErrorBoundary } from "@/components/error-boundary"

interface UploadedImagesProps {
  userEmail?: string
}

export function UploadedImages({ userEmail = 'user@tattoo-studio.com' }: UploadedImagesProps) {
  const {
    uploadedImages,
    isLoading,
    error,
    totalImages,
    lastUpdated,
    refreshImages,
    getStorageStats,
    searchImages,
    clearError
  } = useUploadedImages(userEmail)

  // Refresh images when component mounts
  useEffect(() => {
    refreshImages()
  }, [refreshImages])

  const storageStats = getStorageStats()

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Uploaded Images Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Uploaded Images</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card - Cloud Storage Management */}
            <Card>
              <CardHeader>
                <CardTitle>Cloud Storage Management</CardTitle>
                <CardDescription>Permanent storage in Vercel Blob + Neon metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Storage Status */}
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>✅ Images stored in Vercel Blob storage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>✅ Metadata stored in Neon database</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span>✅ Complete traceability and search</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>✅ CDN delivery for fast loading</span>
                  </div>
                </div>

                <Separator />

                {/* Last Updated */}
                {lastUpdated && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-muted-foreground">
                      {lastUpdated.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Storage Statistics */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Cloud Storage Statistics</Label>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Images:</span>
                      <p className="font-medium">{totalImages}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Storage Used:</span>
                      <p className="font-medium">{storageStats.storageUsed}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Average Size:</span>
                      <p className="font-medium">{storageStats.averageSizeBytes.toLocaleString()} bytes</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Public URLs:</span>
                      <p className="font-medium text-green-600">Available</p>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="flex items-start space-x-2 rounded-md border border-red-200 bg-red-50 p-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-800">
                      {error}
                    </div>
                    <Button
                      onClick={clearError}
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                    >
                      Clear
                    </Button>
                  </div>
                )}

                <Button
                  onClick={() => refreshImages()}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Images
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Right Card - Persistent Image Library */}
            <Card>
              <CardHeader>
                <CardTitle>Persistent Image Library</CardTitle>
                <CardDescription>Browse images stored in Blob + Neon database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading cloud storage images...</p>
                  </div>
                ) : uploadedImages.length > 0 ? (
                  <>
                    {/* Images Gallery */}
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {totalImages} images in permanent storage
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {uploadedImages.map((image) => (
                          <div key={image.id} className="relative bg-muted rounded-lg overflow-hidden">
                            <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex flex-col items-center justify-center p-3">
                              <div className="text-center">
                                <Cloud className="h-6 w-6 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                                <Database className="h-4 w-4 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                                  Blob + Neon
                                </span>
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 block mt-1">
                                  {image.id.slice(-6)}
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
                                URL Ready
                              </Badge>
                            </div>
                            {image.size && (
                              <div className="absolute top-1 right-1">
                                <Badge variant="secondary" className="text-[8px] h-4 px-1">
                                  {(image.size / 1024).toFixed(0)}KB
                                </Badge>
                              </div>
                            )}
                            {/* File info tooltip */}
                            <div className="absolute bottom-1 left-1">
                              <Badge variant="outline" className="text-[8px] h-4 px-1">
                                {image.filename.split('.').pop()?.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-xs text-muted-foreground mt-3 space-y-1">
                        <p>• Each image has permanent Blob URL for instant access</p>
                        <p>• Complete metadata stored in Neon for search/filtering</p>
                        <p>• CDN delivery ensures fast worldwide loading</p>
                        <p>• All data backed up and version controlled</p>
                      </div>

                      {/* Export Option */}
                      <div className="pt-2 border-t">
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Export Image URLs (JSON)
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Cloud className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No images in cloud storage yet.</p>
                    <p className="text-sm">Upload verified images to see them here with permanent URLs.</p>
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
