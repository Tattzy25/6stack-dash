import { useState, useCallback } from 'react'

export interface PromptConfig {
  provider: string
  customEndpoint: string
  model: string
  apiKey: string
  systemPrompt: string
  userMessage: string
  outputFormat: string
}

export interface PromptsState {
  config: PromptConfig
  isGenerating: boolean
  progress: { created: number; total: number }
  generatedOutput: string
  error: string | null
}

export const initialPromptConfig: PromptConfig = {
  provider: '',
  customEndpoint: '',
  model: '',
  apiKey: '',
  systemPrompt: '',
  userMessage: '',
  outputFormat: 'markdown'
}

export const initialPromptsState: PromptsState = {
  config: initialPromptConfig,
  isGenerating: false,
  progress: { created: 0, total: 0 },
  generatedOutput: '',
  error: null
}

export function usePrompts() {
  const [state, setState] = useState<PromptsState>(initialPromptsState)

  const updateConfig = useCallback((updates: Partial<PromptConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates },
      error: null
    }))
  }, [])

  const validateConfig = useCallback(() => {
    const { provider, model, systemPrompt, userMessage, apiKey, customEndpoint } = state.config

    if (!provider || !model || !systemPrompt || !userMessage) {
      throw new Error('Please fill in all required fields')
    }

    if (!apiKey) {
      throw new Error('Please save your API key first')
    }

    if (provider === 'custom' && !customEndpoint) {
      throw new Error('Custom endpoint is required for custom provider')
    }

    return true
  }, [state.config])

  const generateItem = useCallback((index: number, prompt: string, format: string) => {
    switch (format) {
      case "json":
        return JSON.stringify({
          id: index,
          prompt: prompt,
          created: new Date().toISOString()
        })
      case "csv":
        return `${index},"${prompt.replace(/"/g, '""')}","${new Date().toISOString()}"`
      case "text":
        return `Prompt ${index}: ${prompt}`
      case "markdown":
      default:
        return `## Prompt ${index}\n\n${prompt}\n`
    }
  }, [])

  const startGeneration = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        error: null,
        isGenerating: true,
        progress: { created: 0, total: 0 },
        generatedOutput: ''
      }))

      validateConfig()

      // Extract number from user message
      const numberMatch = state.config.userMessage.match(/\d+/)
      const totalPrompts = numberMatch ? parseInt(numberMatch[0]) : 10

      setState(prev => ({
        ...prev,
        progress: { ...prev.progress, total: totalPrompts }
      }))

      // Call prompts API
      const response = await fetch('/api/generate/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: state.config.provider,
          model: state.config.model,
          apiKey: state.config.apiKey,
          systemPrompt: state.config.systemPrompt,
          userMessage: state.config.userMessage,
          totalPrompts,
          outputFormat: state.config.outputFormat,
          ...(state.config.provider === 'custom' && { customEndpoint: state.config.customEndpoint })
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate prompts')
      }

      const result = await response.json()
      let promptIndex = 0

      // Process prompts with progress updates
      for (const prompt of result.prompts) {
        promptIndex++
        await new Promise(resolve => setTimeout(resolve, 300))
        setState(prev => ({
          ...prev,
          progress: { ...prev.progress, created: promptIndex },
          generatedOutput: prev.generatedOutput + (prev.generatedOutput ? "\n" : "") +
            generateItem(promptIndex, prompt, state.config.outputFormat)
        }))
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        progress: { created: 0, total: 0 },
        generatedOutput: ''
      }))
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }))
    }
  }, [state.config, validateConfig, generateItem])

  const reset = useCallback(() => {
    setState(initialPromptsState)
  }, [])

  return {
    ...state,
    updateConfig,
    startGeneration,
    reset
  }
}
