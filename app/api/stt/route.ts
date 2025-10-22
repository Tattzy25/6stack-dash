import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import fs from "fs"
import os from "os"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
  const { provider = "openai", language = "en-US", model = "gpt-4o-mini-transcribe", audioBase64 } = body || {}

    if (provider === "openai") {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        return NextResponse.json({ ok: false, error: "OPENAI_API_KEY not set" }, { status: 500 })
      }
      if (!audioBase64) {
        return NextResponse.json({ ok: false, error: "audioBase64 required for server STT" }, { status: 400 })
      }

      const openai = new OpenAI({ apiKey })
      const buffer = Buffer.from(audioBase64, "base64")
      const tmpFile = path.join(os.tmpdir(), `stt-${Date.now()}.webm`)
      await fs.promises.writeFile(tmpFile, buffer)
      try {
        const transcription: any = await openai.audio.transcriptions.create({
          file: fs.createReadStream(tmpFile) as any,
          model,
          // Some models support language hints; Whisper defaults to auto-detect.
          // language,
        })
        const text = transcription?.text || transcription?.data || ""
        return NextResponse.json({ ok: true, provider, language, model, text })
      } finally {
        fs.promises.unlink(tmpFile).catch(() => {})
      }
    }

    return NextResponse.json({ ok: false, error: `Provider '${provider}' not implemented` }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "STT error" }, { status: 500 })
  }
}