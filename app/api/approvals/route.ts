import { NextRequest, NextResponse } from "next/server"
import { listApprovals, createApproval, Approval } from "@/lib/persistence"

export async function GET() {
  const approvals = await listApprovals()
  return NextResponse.json({ ok: true, approvals })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { toolId, role, params } = body || {}
  if (!toolId || !role) {
    return NextResponse.json({ ok: false, error: "toolId and role required" }, { status: 400 })
  }
  const a: Approval = {
    id: crypto.randomUUID(),
    toolId,
    role,
    params,
    status: "pending",
    createdAt: new Date().toISOString(),
  }
  await createApproval(a)
  return NextResponse.json({ ok: true, approval: a })
}