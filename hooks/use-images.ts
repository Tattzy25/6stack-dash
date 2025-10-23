import { useState, useCallback } from 'react'

export interface ImageConfig {
  provider: string
  model: string
  apiKey: string
  prompt: string
  userEmail: string
  licenseKey: string
}

export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  model: string
  width: number
  height: number
  createdAt: string
  tags: string[]
}

export interface ImagesState {
  config: ImageConfig
  isGenerating: boolean
  progress: { created: number; total: number }
  generatedImages: string[] // For backward compatibility, but will be replaced with real URLs
  realGeneratedImages: GeneratedImage[] // Real images from API
  error: string | null
}

export const initialImageConfig: ImageConfig = {
  provider: '',
  model: '',
  apiKey: '',
  prompt: '',
  userEmail: '',
  licenseKey: ''
}

export const initialImagesState: ImagesState = {
  config: initialImageConfig,
  isGenerating: false,
  progress: { created: 0, total: 0 },
  generatedImages: [],
  realGeneratedImages: [],
  error: null
}

export function useImages() {
  const [state, setState] = useState<ImagesState>(initialImagesState)

  const updateConfig = useCallback((updates: Partial<ImageConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates },
      error: null
    }))
  }, [])

  const validateConfig = useCallback(() => {
    const { provider, model, prompt, apiKey, userEmail, licenseKey } = state.config

    if (!provider || !model || !prompt) {
      throw new Error('Please fill in all required fields')
    }

    if (!apiKey) {
      throw new Error('Please save your API key first')
    }

    if (!userEmail || !licenseKey) {
      throw new Error('User email and license key are required')
    }

    return true
  }, [state.config])

  const generateSingleImage = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        error: null,
        isGenerating: true,
        progress: { created: 0, total: 1 },
        generatedImages: [],
        realGeneratedImages: []
      }))

      validateConfig()

      // Call single image generation API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: state.config.prompt,
          userEmail: state.config.userEmail,
          licenseKey: state.config.licenseKey,
          model: state.config.model,
          width: 512,
          height: 512,
          steps: 30,
          guidanceScale: 7.5,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate image')
      }

      const result = await response.json()

      // Update progress to show completion
      await new Promise(resolve => setTimeout(resolve, 1000))
      setState(prev => ({
        ...prev,
        progress: { created: 1, total: 1 },
        generatedImages: [result.image.url],
        realGeneratedImages: [{
          id: result.image.id,
          url: result.image.url,
          prompt: result.image.prompt,
          model: result.image.model,
          width: result.image.width,
          height: result.image.height,
          createdAt: result.image.createdAt,
          tags: result.image.tags
        }]
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        progress: { created: 0, total: 0 },
        generatedImages: [],
        realGeneratedImages: []
      }))
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }))
    }
  }, [state.config, validateConfig])

  const generateBatchImages = useCallback(async (prompts: string[], totalCount: number = 5) => {
    try {
      setState(prev => ({
        ...prev,
        error: null,
        isGenerating: true,
        progress: { created: 0, total: totalCount },
        generatedImages: [],
        realGeneratedImages: []
      }))

      validateConfig()

      if (prompts.length === 0) {
        throw new Error('No prompts provided')
      }

      // Use the first prompt as base for now, or batch generate if multiple prompts
      if (prompts.length === 1) {
        // Generate multiple images with same prompt
        const batchPrompts = Array(totalCount).fill(prompts[0])

        const response = await fetch('/api/generate/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompts: batchPrompts,
            userEmail: state.config.userEmail,
            licenseKey: state.config.licenseKey,
            model: state.config.model,
            width: 512,
            height: 512,
            steps: 30,
            guidanceScale: 7.5,
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to generate images')
        }

        const result = await response.json()

        // For backward compatibility, still populate the string array
        const imageUrls = result.images.map((img: GeneratedImage) => img.url)

        // Update progress incrementally for visual feedback
        for (let i = 0; i < result.images.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 500))
          setState(prev => ({
            ...prev,
            progress: { ...prev.progress, created: i + 1 },
            generatedImages: imageUrls.slice(0, i + 1),
            realGeneratedImages: result.images.slice(0, i + 1)
          }))
        }

      } else {
        // Generate images for different prompts
        setState(prev => ({
          ...prev,
          progress: { created: 0, total: prompts.length }
        }))

        const response = await fetch('/api/generate/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompts,
            userEmail: state.config.userEmail,
            licenseKey: state.config.licenseKey,
            model: state.config.model,
            width: 512,
            height: 512,
            steps: 30,
            guidanceScale: 7.5,
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to generate images')
        }

        const result = await response.json()

        // Update progress incrementally
        for (let i = 0; i < result.images.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 500))
          setState(prev => ({
            ...prev,
            progress: { ...prev.progress, created: i + 1 },
            generatedImages: result.images.slice(0, i + 1).map((img: GeneratedImage) => img.url),
            realGeneratedImages: result.images.slice(0, i + 1)
          }))
        }
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        progress: { created: 0, total: 0 },
        generatedImages: [],
        realGeneratedImages: []
      }))
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }))
    }
  }, [state.config, validateConfig])

  const reset = useCallback(() => {
    setState(initialImagesState)
  }, [])

  const clearImages = useCallback(() => {
    setState(prev => ({
      ...prev,
      generatedImages: [],
      realGeneratedImages: [],
      progress: { created: 0, total: 0 }
    }))
  }, [])

  return {
    ...state,
    updateConfig,
    generateSingleImage,
    generateBatchImages,
    reset,
    clearImages
  }
}
