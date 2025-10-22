import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { log } from "@/lib/persistence"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { message = "", channel = "default", publicKey = "", sharedSecret = "" } = body || {}
  if (!message) return NextResponse.json({ ok: false, error: "message required" }, { status: 400 })

  const secret = sharedSecret || process.env.BRIDGE_SHARED_SECRET || "dev-secret"
  const signature = crypto.createHmac("sha256", secret).update(message).digest("hex")
  await log({ id: crypto.randomUUID(), type: "bridge.forward", data: { channel }, ts: new Date().toISOString() })

  // TODO: forward to external agent via SSE/HTTP per MCP spec
  return NextResponse.json({ ok: true, forwarded: false, signature })
}