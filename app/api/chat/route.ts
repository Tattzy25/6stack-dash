import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      provider = "groq",
      model = "openai/gpt-oss-120b",
      messages = [],
      system = "",
      apiKey = "",
      temperature = 0.7,
    } = body || {}

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ ok: false, error: "messages array required" }, { status: 400 })
    }

    // Normalize message structure to OpenAI-style { role, content }
    const normalizedMessages = [
      ...(system ? [{ role: "system", content: system }] : []),
      ...messages.map((m: any) => ({ role: m.role, content: m.content ?? m.text ?? "" })),
    ]

    if (provider === "groq") {
      const key = apiKey || process.env.GROQ_API_KEY
      if (!key) return NextResponse.json({ ok: false, error: "GROQ_API_KEY not set" }, { status: 500 })
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, messages: normalizedMessages, temperature }),
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => "")
        return NextResponse.json({ ok: false, error: `Groq error ${res.status} ${res.statusText} ${errText}` }, { status: 500 })
      }
      const data = await res.json().catch(() => ({}))
      const text = data?.choices?.[0]?.message?.content ?? ""
      return NextResponse.json({ ok: true, provider: "groq", model, text, raw: data })
    }

    if (provider === "openai") {
      const key = apiKey || process.env.OPENAI_API_KEY
      if (!key) return NextResponse.json({ ok: false, error: "OPENAI_API_KEY not set" }, { status: 500 })
      const openai = new OpenAI({ apiKey: key })
      const completion = await openai.chat.completions.create({ model, messages: normalizedMessages as any, temperature })
      const text = completion?.choices?.[0]?.message?.content ?? ""
      return NextResponse.json({ ok: true, provider: "openai", model, text, raw: completion })
    }

    return NextResponse.json({ ok: false, error: `Provider '${provider}' not implemented` }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "chat error" }, { status: 500 })
  }
}