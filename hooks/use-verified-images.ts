import { useState, useCallback } from 'react'

export interface UploadedImage {
  id?: string
  blobUrl?: string
  previewUrl?: string
  filename?: string
  size?: number
  type?: string
  createdAt?: string
  tags?: string[]
}

export interface VerifiedImagesState {
  verifiedImages: UploadedImage[]
  isUploading: boolean
  uploadProgress: { uploaded: number; total: number }
  error: string | null
}

export const initialVerifiedImagesState: VerifiedImagesState = {
  verifiedImages: [],
  isUploading: false,
  uploadProgress: { uploaded: 0, total: 0 },
  error: null
}

export function useVerifiedImages() {
  const [state, setState] = useState<VerifiedImagesState>(initialVerifiedImagesState)

  const addVerifiedImage = useCallback((image: UploadedImage) => {
    setState(prev => ({
      ...prev,
      verifiedImages: [...prev.verifiedImages, image],
      error: null
    }))
  }, [])

  const addVerifiedImages = useCallback((images: UploadedImage[]) => {
    setState(prev => ({
      ...prev,
      verifiedImages: [...prev.verifiedImages, ...images],
      error: null
    }))
  }, [])

  const removeVerifiedImage = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      verifiedImages: prev.verifiedImages.filter(img => img.id !== id),
    }))
  }, [])

  const uploadSelectedImages = useCallback(async (
    selectedImageUrls: string[],
    userEmail: string,
    licenseKey: string
  ) => {
    if (selectedImageUrls.length === 0 || !userEmail || !licenseKey) return

    setState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: { uploaded: 0, total: selectedImageUrls.length },
      error: null
    }))

    for (let i = 0; i < selectedImageUrls.length; i++) {
      try {
        // Fetch the image from the selected URL
        const response = await fetch(selectedImageUrls[i])
        if (!response.ok) {
          throw new Error(`Failed to fetch image from ${selectedImageUrls[i]}`)
        }

        const imageBlob = await response.blob()

        // Create FormData for API upload
        const formData = new FormData()
        const file = new File([imageBlob], `verified-image-${i + 1}.jpg`, { type: 'image/jpeg' })
        formData.append('file', file)
        formData.append('filename', file.name)
        formData.append('userEmail', userEmail)
        formData.append('licenseKey', licenseKey)

        // Upload via API route to Vercel Blob + Neon
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(`Upload failed: ${errorData.error}`)
        }

        const data = await uploadResponse.json()

        // Add uploaded image with real data from Blob + Neon
        const uploadedImage: UploadedImage = {
          id: data.image.id,
          blobUrl: data.image.blobUrl,
          filename: data.image.filename,
          size: data.image.size,
          type: data.image.type,
          createdAt: data.image.createdAt,
          tags: ['verified', 'generated', 'batch']
        }

        setState(prev => ({
          ...prev,
          verifiedImages: [...prev.verifiedImages, uploadedImage],
          uploadProgress: { ...prev.uploadProgress, uploaded: i + 1 }
        }))

      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Upload failed',
          uploadProgress: { ...prev.uploadProgress, uploaded: i + 1 }
        }))
        console.error(`Failed to upload ${selectedImageUrls[i]}:`, error)
      }
    }

    setState(prev => ({
      ...prev,
      isUploading: false,
      uploadProgress: { uploaded: 0, total: 0 }
    }))
  }, [])

  const uploadBulkFiles = useCallback(async (
    files: File[],
    userEmail: string,
    licenseKey: string
  ) => {
    if (files.length === 0 || !userEmail || !licenseKey) return

    setState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: { uploaded: 0, total: files.length },
      error: null
    }))

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i]

        // Create FormData for API upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('filename', file.name)
        formData.append('userEmail', userEmail)
        formData.append('licenseKey', licenseKey)

        // Upload via API route
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()

        // Create preview URL for immediate display (will be cleaned up by caller)
        const previewUrl = URL.createObjectURL(file)

        // Add to verified images with response data and local preview
        const uploadedImage: UploadedImage = {
          id: data.image.id,
          blobUrl: data.image.blobUrl,
          previewUrl,
          filename: data.image.filename,
          size: data.image.size,
          type: data.image.type,
          createdAt: data.image.createdAt,
          tags: ['uploaded', 'manual', 'batch']
        }

        setState(prev => ({
          ...prev,
          verifiedImages: [...prev.verifiedImages, uploadedImage],
          uploadProgress: { ...prev.uploadProgress, uploaded: i + 1 }
        }))

      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'File upload failed',
          uploadProgress: { ...prev.uploadProgress, uploaded: i + 1 }
        }))
        console.error(`Failed to upload file ${files[i].name}:`, error)
      }
    }

    setState(prev => ({
      ...prev,
      isUploading: false,
      uploadProgress: { uploaded: 0, total: 0 }
    }))
  }, [])

  const clearVerifiedImages = useCallback(() => {
    setState(prev => ({
      ...prev,
      verifiedImages: [],
      uploadProgress: { uploaded: 0, total: 0 }
    }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error
    }))
  }, [])

  const reset = useCallback(() => {
    setState(initialVerifiedImagesState)
  }, [])

  const getVerifiedCount = useCallback(() => {
    return state.verifiedImages.length
  }, [state.verifiedImages.length])

  const hasVerifiedImages = useCallback(() => {
    return state.verifiedImages.length > 0
  }, [state.verifiedImages.length])

  return {
    ...state,
    addVerifiedImage,
    addVerifiedImages,
    removeVerifiedImage,
    uploadSelectedImages,
    uploadBulkFiles,
    clearVerifiedImages,
    setError,
    reset,
    getVerifiedCount,
    hasVerifiedImages
  }
}
