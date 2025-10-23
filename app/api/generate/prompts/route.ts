import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { provider, model, apiKey, systemPrompt, userMessage, totalPrompts, outputFormat, customEndpoint } = await request.json()

    if (!provider || !model || !apiKey || !systemPrompt || !userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, model, apiKey, systemPrompt, userMessage' },
        { status: 400 }
      )
    }

    const prompts = []

    // Generate prompts based on the batch size
    for (let i = 0; i < totalPrompts; i++) {
      try {
        let prompt = ''

        if (provider === 'openai' || provider === 'azure') {
          // OpenAI API call
          const openaiUrl = provider === 'azure'
            ? (customEndpoint || 'https://api.openai.azure.com/v1/chat/completions')
            : 'https://api.openai.com/v1/chat/completions'

          const openaiResponse = await fetch(openaiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              ...(provider === 'azure' && {
                'api-key': apiKey,
                'Authorization': ''
              })
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `${userMessage} (Prompt ${i + 1})` }
              ],
              temperature: 0.7,
              max_tokens: 300
            })
          })

          if (!openaiResponse.ok) {
            const error = await openaiResponse.text()
            throw new Error(`OpenAI API error: ${openaiResponse.status} - ${error}`)
          }

          const openaiData = await openaiResponse.json()
          prompt = openaiData.choices[0]?.message?.content || `Generated prompt ${i + 1}`

        } else if (provider === 'anthropic') {
          // Anthropic API call
          const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: model,
              max_tokens: 300,
              system: systemPrompt,
              messages: [
                { role: 'user', content: `${userMessage} (Prompt ${i + 1})` }
              ]
            })
          })

          if (!anthropicResponse.ok) {
            const error = await anthropicResponse.text()
            throw new Error(`Anthropic API error: ${anthropicResponse.status} - ${error}`)
          }

          const anthropicData = await anthropicResponse.json()
          prompt = anthropicData.content[0]?.text || `Generated prompt ${i + 1}`

        } else if (provider === 'google') {
          // Google API call
          const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `${systemPrompt}\n\n${userMessage} (Prompt ${i + 1})`
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 300,
              }
            })
          })

          if (!googleResponse.ok) {
            const error = await googleResponse.text()
            throw new Error(`Google API error: ${googleResponse.status} - ${error}`)
          }

          const googleData = await googleResponse.json()
          prompt = googleData.candidates[0]?.content?.parts[0]?.text || `Generated prompt ${i + 1}`

        } else if (provider === 'openrouter') {
          // OpenRouter API call (supports multiple providers)
          const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': 'http://localhost:3002', // Required by OpenRouter
              'X-Title': 'Batch Prompt Generator'
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `${userMessage} (Prompt ${i + 1})` }
              ],
              temperature: 0.7,
              max_tokens: 300
            })
          })

          if (!openrouterResponse.ok) {
            const error = await openrouterResponse.text()
            throw new Error(`OpenRouter API error: ${openrouterResponse.status} - ${error}`)
          }

          const openrouterData = await openrouterResponse.json()
          prompt = openrouterData.choices[0]?.message?.content || `Generated prompt ${i + 1}`

        } else if (provider === 'custom') {
          // Custom API endpoint
          const customResponse = await fetch(customEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `${userMessage} (Prompt ${i + 1})` }
              ],
              temperature: 0.7,
              max_tokens: 300
            })
          })

          if (!customResponse.ok) {
            const error = await customResponse.text()
            throw new Error(`Custom API error: ${customResponse.status} - ${error}`)
          }

          const customData = await customResponse.json()
          prompt = customData.choices?.[0]?.message?.content || customData.content || `Generated prompt ${i + 1}`

        } else {
          throw new Error(`Provider '${provider}' is not fully implemented. Please use OpenAI, Anthropic, Google, OpenRouter, or Custom providers.`)
        }

        prompts.push(prompt)

      } catch (error) {
        console.error(`Error generating prompt ${i + 1}:`, error)
        // Add fallback prompt on error
        prompts.push(`Generated prompt ${i + 1} (API temporarily unavailable)`)
      }
    }

    return NextResponse.json({
      success: true,
      prompts: prompts,
      metadata: {
        provider,
        model,
        totalPrompts,
        outputFormat,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Prompt generation failed:', error)
    return NextResponse.json(
      {
        error: 'Prompt generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
