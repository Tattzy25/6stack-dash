import { NextRequest, NextResponse } from "next/server"
import { getPolicy, isAllowed, requiresApproval } from "@/lib/allowed-tools"
import { initBucket, takeToken } from "@/lib/rate-limit"
import { createApproval, log } from "@/lib/persistence"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { toolId, role = "assistant", params = {} } = body || {}
  if (!toolId) return NextResponse.json({ ok: false, error: "toolId required" }, { status: 400 })
  const policy = getPolicy(toolId)
  if (!policy) return NextResponse.json({ ok: false, error: "unknown tool" }, { status: 400 })
  if (!isAllowed(toolId, role)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })

  const bucketKey = `${role}:${toolId}`
  initBucket(bucketKey, policy.rateLimit.limit, policy.rateLimit.windowSec)
  if (!takeToken(bucketKey)) {
    await log({ id: crypto.randomUUID(), type: "rate.limit", message: `${bucketKey} throttled`, ts: new Date().toISOString() })
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 })
  }

  if (requiresApproval(toolId)) {
    const approval = await createApproval({
      id: crypto.randomUUID(),
      toolId,
      role,
      params,
      status: "pending",
      createdAt: new Date().toISOString(),
    })
    await log({ id: crypto.randomUUID(), type: "approval.create", data: { toolId, role }, ts: new Date().toISOString() })
    return NextResponse.json({ ok: true, status: "awaiting_approval", approvalId: approval.id })
  }

  // Execution stubs
  await log({ id: crypto.randomUUID(), type: "tool.execute", data: { toolId, role, params, exec: policy.execution }, ts: new Date().toISOString() })
  return NextResponse.json({ ok: true, status: policy.execution === "sandbox" ? "queued" : "completed", execution: policy.execution })
}