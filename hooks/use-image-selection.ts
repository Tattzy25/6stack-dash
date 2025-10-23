import { useState, useCallback } from 'react'

export interface ImageSelectionState {
  selectedImages: Set<string>
  isSelecting: boolean
}

export const initialImageSelectionState: ImageSelectionState = {
  selectedImages: new Set(),
  isSelecting: false
}

export function useImageSelection() {
  const [state, setState] = useState<ImageSelectionState>(initialImageSelectionState)

  const selectImage = useCallback((imageUrl: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedImages)
      if (newSelected.has(imageUrl)) {
        newSelected.delete(imageUrl)
      } else {
        newSelected.add(imageUrl)
      }
      return {
        ...prev,
        selectedImages: newSelected
      }
    })
  }, [])

  const selectImages = useCallback((imageUrls: string[]) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedImages)
      imageUrls.forEach(url => newSelected.add(url))
      return {
        ...prev,
        selectedImages: newSelected
      }
    })
  }, [])

  const deselectImage = useCallback((imageUrl: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedImages)
      newSelected.delete(imageUrl)
      return {
        ...prev,
        selectedImages: newSelected
      }
    })
  }, [])

  const deselectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedImages: new Set()
    }))
  }, [])

  const selectAll = useCallback((imageUrls: string[]) => {
    setState(prev => ({
      ...prev,
      selectedImages: new Set(imageUrls)
    }))
  }, [])

  const toggleSelectAll = useCallback((imageUrls: string[]) => {
    setState(prev => {
      const allSelected = imageUrls.every(url => prev.selectedImages.has(url))
      if (allSelected) {
        return {
          ...prev,
          selectedImages: new Set()
        }
      } else {
        return {
          ...prev,
          selectedImages: new Set(imageUrls)
        }
      }
    })
  }, [])

  const isSelected = useCallback((imageUrl: string) => {
    return state.selectedImages.has(imageUrl)
  }, [state.selectedImages])

  const hasSelections = useCallback(() => {
    return state.selectedImages.size > 0
  }, [state.selectedImages.size])

  const getSelectedCount = useCallback(() => {
    return state.selectedImages.size
  }, [state.selectedImages.size])

  const getSelectedArray = useCallback(() => {
    return Array.from(state.selectedImages)
  }, [state.selectedImages])

  const setSelecting = useCallback((isSelecting: boolean) => {
    setState(prev => ({
      ...prev,
      isSelecting
    }))
  }, [])

  const reset = useCallback(() => {
    setState(initialImageSelectionState)
  }, [])

  return {
    ...state,
    selectImage,
    selectImages,
    deselectImage,
    deselectAll,
    selectAll,
    toggleSelectAll,
    isSelected,
    hasSelections,
    getSelectedCount,
    getSelectedArray,
    setSelecting,
    reset
  }
}
