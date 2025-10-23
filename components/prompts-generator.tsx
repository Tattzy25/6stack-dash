"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { usePrompts } from "@/hooks/use-prompts"
import { ErrorBoundary } from "@/components/error-boundary"

export function PromptsGenerator() {
  const {
    config,
    updateConfig,
    isGenerating,
    progress,
    generatedOutput,
    error,
    startGeneration
  } = usePrompts()

  const handleProviderChange = (value: string) => {
    updateConfig({ provider: value })
  }

  const handleModelChange = (value: string) => {
    updateConfig({ model: value })
  }

  const handleCustomEndpointChange = (value: string) => {
    updateConfig({ customEndpoint: value })
  }

  const handleApiKeyChange = (value: string) => {
    updateConfig({ apiKey: value })
  }

  const handleSystemPromptChange = (value: string) => {
    updateConfig({ systemPrompt: value })
  }

  const handleUserMessageChange = (value: string) => {
    updateConfig({ userMessage: value })
  }

  const handleOutputFormatChange = (value: string) => {
    updateConfig({ outputFormat: value })
  }

  const providers = [
    { value: "openai", label: "OpenAI" },
    { value: "anthropic", label: "Anthropic" },
    { value: "google", label: "Google" },
    { value: "openrouter", label: "OpenRouter" },
    { value: "together", label: "Together AI" },
    { value: "replicate", label: "Replicate" },
    { value: "huggingface", label: "Hugging Face" },
    { value: "cohere", label: "Cohere" },
    { value: "mistral", label: "Mistral AI" },
    { value: "groq", label: "Groq" },
    { value: "azure", label: "Azure OpenAI" },
    { value: "fireworks", label: "Fireworks AI" },
    { value: "perplexity", label: "Perplexity AI" },
    { value: "custom", label: "Custom API" },
  ]

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Prompt Generation Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Prompt Generation</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card - Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt Batch Configuration</CardTitle>
                <CardDescription>Configure your AI provider and prompts for batch generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Provider Settings */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Select value={config.provider} onValueChange={handleProviderChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      type="text"
                      value={config.model}
                      onChange={(e) => handleModelChange(e.target.value)}
                      placeholder="e.g. gpt-4, claude-3-sonnet-20240229, gemini-pro"
                    />
                  </div>

                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder="Enter your API key"
                    />
                  </div>

                  {config.provider === 'custom' && (
                    <div>
                      <Label htmlFor="customEndpoint">Custom API Endpoint</Label>
                      <Input
                        id="customEndpoint"
                        type="url"
                        value={config.customEndpoint}
                        onChange={(e) => handleCustomEndpointChange(e.target.value)}
                        placeholder="https://your-api-endpoint.com/v1/chat/completions"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* System Prompt */}
                <div>
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={config.systemPrompt}
                    onChange={(e) => handleSystemPromptChange(e.target.value)}
                    placeholder="Enter your system prompt..."
                    className="min-h-[100px] resize-y"
                  />
                </div>

                {/* User Message */}
                <div>
                  <Label htmlFor="userMessage">User Message Example</Label>
                  <Textarea
                    id="userMessage"
                    value={config.userMessage}
                    onChange={(e) => handleUserMessageChange(e.target.value)}
                    placeholder="Create a batch of 50 prompts about..."
                    className="min-h-[80px] resize-y"
                  />
                </div>

                {/* Output Format */}
                <div>
                  <Label>Output Format</Label>
                  <ToggleGroup
                    type="single"
                    value={config.outputFormat}
                    onValueChange={(value) => value && handleOutputFormatChange(value)}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="markdown">Markdown</ToggleGroupItem>
                    <ToggleGroupItem value="json">JSON</ToggleGroupItem>
                    <ToggleGroupItem value="text">Text</ToggleGroupItem>
                    <ToggleGroupItem value="csv">CSV</ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {error && (
                  <div className="flex items-start space-x-2 rounded-md border border-red-200 bg-red-50 p-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-800">
                      {error}
                    </div>
                  </div>
                )}

                <Button
                  onClick={startGeneration}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Start Batch Generation"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Right Card - Live Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Live Batch Tracking</CardTitle>
                <CardDescription>Monitor batch generation progress in real-time</CardDescription>
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
                      <span className="text-sm text-muted-foreground">prompts generated</span>
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

                {/* Generated Output */}
                <div className="space-y-2">
                  <Label>Generated Prompts</Label>
                  <Textarea
                    value={generatedOutput}
                    readOnly
                    className="min-h-[300px] font-mono text-sm"
                    placeholder={
                      config.outputFormat === "json" ? "JSON output will appear here..." :
                      config.outputFormat === "csv" ? "CSV output will appear here..." :
                      config.outputFormat === "markdown" ? "# Markdown output will appear here..." :
                      "Text output will appear here..."
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
