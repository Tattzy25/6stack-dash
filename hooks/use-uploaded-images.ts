import { useState, useEffect, useCallback } from 'react'

export interface UploadedImageQuery {
  id: string
  filename: string
  blobUrl: string
  size: number
  contentType: string
  tags: string[]
  createdAt: string
}

export interface UploadedImagesState {
  uploadedImages: UploadedImageQuery[]
  isLoading: boolean
  error: string | null
  totalImages: number
  lastUpdated: Date | null
}

export const initialUploadedImagesState: UploadedImagesState = {
  uploadedImages: [],
  isLoading: false,
  error: null,
  totalImages: 0,
  lastUpdated: null
}

export function useUploadedImages(userEmail?: string) {
  const [state, setState] = useState<UploadedImagesState>(initialUploadedImagesState)

  const fetchUploadedImages = useCallback(async (email?: string) => {
    if (!email) return

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }))

    try {
      // Fetch real uploaded images from Neon database
      const response = await fetch(`/api/list-images?email=${encodeURIComponent(email)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch uploaded images')
      }

      const data = await response.json()
      setState(prev => ({
        ...prev,
        uploadedImages: data.images || [],
        totalImages: data.total || (data.images || []).length,
        lastUpdated: new Date(),
        isLoading: false
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load uploaded images',
        isLoading: false
      }))
    }
  }, [])

  const refreshImages = useCallback(async () => {
    if (userEmail) {
      await fetchUploadedImages(userEmail)
    }
  }, [fetchUploadedImages, userEmail])

  const addUploadedImage = useCallback((image: UploadedImageQuery) => {
    setState(prev => ({
      ...prev,
      uploadedImages: [image, ...prev.uploadedImages],
      totalImages: prev.totalImages + 1,
      error: null
    }))
  }, [])

  const removeUploadedImage = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter(img => img.id !== id),
      totalImages: Math.max(0, prev.totalImages - 1),
    }))
  }, [])

  const getImageById = useCallback((id: string) => {
    return state.uploadedImages.find(img => img.id === id)
  }, [state.uploadedImages])

  const getImagesByTag = useCallback((tag: string) => {
    return state.uploadedImages.filter(img => img.tags.includes(tag))
  }, [state.uploadedImages])

  const getStorageStats = useCallback(() => {
    const totalSize = state.uploadedImages.reduce((sum, img) => sum + (img.size || 0), 0)
    const averageSize = state.totalImages > 0 ? totalSize / state.totalImages : 0

    return {
      totalImages: state.totalImages,
      totalSizeBytes: totalSize,
      averageSizeBytes: Math.round(averageSize),
      storageUsed: formatBytes(totalSize)
    }
  }, [state.uploadedImages, state.totalImages])

  const searchImages = useCallback((query: string) => {
    if (!query.trim()) return state.uploadedImages

    const lowercaseQuery = query.toLowerCase()
    return state.uploadedImages.filter(img =>
      img.filename.toLowerCase().includes(lowercaseQuery) ||
      img.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }, [state.uploadedImages])

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error
    }))
  }, [])

  const reset = useCallback(() => {
    setState(initialUploadedImagesState)
  }, [])

  // Auto-fetch images on mount and when userEmail changes
  useEffect(() => {
    if (userEmail) {
      fetchUploadedImages(userEmail)
    }
  }, [userEmail, fetchUploadedImages])

  // Helper function to format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    ...state,
    fetchUploadedImages,
    refreshImages,
    addUploadedImage,
    removeUploadedImage,
    getImageById,
    getImagesByTag,
    getStorageStats,
    searchImages,
    clearError,
    setError,
    reset
  }
}
