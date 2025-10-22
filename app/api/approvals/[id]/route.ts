import { NextRequest, NextResponse } from "next/server"
import { updateApproval } from "@/lib/persistence"

export async function PATCH(
  req: NextRequest,
  context: RouteContext<"/api/approvals/[id]">
) {
  const { id } = await context.params
  const body = await req.json().catch(() => ({}))
  const { status } = body || {}
  if (!id || !status) {
    return NextResponse.json({ ok: false, error: "id and status required" }, { status: 400 })
  }
  const updated = await updateApproval(id, { status })
  if (!updated) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 })
  return NextResponse.json({ ok: true, approval: updated })
}