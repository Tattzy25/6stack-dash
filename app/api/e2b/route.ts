import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as { code?: string }
    const code = body.code ?? 'print("hello world")'

    // Load the SDK at runtime
    const { Sandbox } = await import('@e2b/code-interpreter')

    // E2B SDK will read E2B_API_KEY from process.env
    const sbx = await Sandbox.create()

    const execution = await sbx.runCode(code)
    const logs = execution?.logs ?? ''

    const files = await sbx.files.list('/')

    // Clean up sandbox
    await sbx.kill?.().catch(() => {})

    return NextResponse.json({ ok: true, logs, files })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}