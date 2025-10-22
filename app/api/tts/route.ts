import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

async function genElevenLabsAudio(opts: { text: string; apiKey: string; voiceId: string }) {
  const { text, apiKey, voiceId } = opts
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.4, similarity_boost: 0.75 },
    }),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => "")
    throw new Error(`ElevenLabs TTS error: ${res.status} ${res.statusText} ${errText}`)
  }
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer).toString("base64")
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      provider = "openai",
      model = "gpt-4o-mini-tts",
      voiceId = "shimmer",
      text = "",
      format = "mp3",
    } = body || {}

    if (!text) {
      return NextResponse.json({ ok: false, error: "text is required for TTS" }, { status: 400 })
    }


    if (provider === "openai") {
      const openaiKey = process.env.OPENAI_API_KEY
      const elevenKey = process.env.ELEVENLABS_API_KEY
      const elevenVoiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"
      // Try OpenAI first if key present
      if (openaiKey) {
        try {
          const openai = new OpenAI({ apiKey: openaiKey })
          const speech = await openai.audio.speech.create({
            model,
            voice: voiceId || "shimmer",
            input: text,
            format: format as any,
          })
          const arrayBuffer = await speech.arrayBuffer()
          const base64 = Buffer.from(arrayBuffer).toString("base64")
          return NextResponse.json({ ok: true, provider: "openai", model, voiceId, format, audioBase64: base64 })
        } catch (e: any) {
          // fall through to ElevenLabs fallback
        }
      }
      // Fallback to ElevenLabs if configured
      if (elevenKey) {
        try {
          const audioBase64 = await genElevenLabsAudio({ text, apiKey: elevenKey, voiceId: elevenVoiceId })
          return NextResponse.json({ ok: true, provider: "elevenlabs_fallback", model: "eleven_multilingual_v2", voiceId: elevenVoiceId, format: "mp3", audioBase64 })
        } catch (e2: any) {
          return NextResponse.json({ ok: false, error: `OpenAI TTS failed and ElevenLabs fallback failed: ${e2?.message || "unknown"}` }, { status: 500 })
        }
      }
      return NextResponse.json({ ok: false, error: "No TTS provider configured (missing OPENAI_API_KEY and ELEVENLABS_API_KEY)" }, { status: 500 })
    }

    // Other providers could be added here (e.g., ElevenLabs). For now, return not implemented.
    return NextResponse.json({ ok: false, error: `Provider '${provider}' not implemented` }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "TTS error" }, { status: 500 })
  }
}