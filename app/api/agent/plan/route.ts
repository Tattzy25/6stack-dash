import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { goal = "", context = {} } = body || {}
  if (!goal || typeof goal !== "string") {
    return NextResponse.json({ ok: false, error: "goal is required" }, { status: 400 })
  }

  const steps: string[] = []
  if (/upload|image|file/i.test(goal)) steps.push("Upload media assets")
  if (/page|section|content/i.test(goal)) steps.push("Update Pages/CMS content")
  if (/code|fix|refactor|route|component/i.test(goal)) steps.push("Prepare code edit diffs")
  if (/fetch|api|http/i.test(goal)) steps.push("Fetch external data via HTTP")
  if (/notify|email|newsletter|marketing/i.test(goal)) steps.push("Compose and schedule marketing content")
  if (!steps.length) steps.push("Analyze request and ask clarifying follow-ups")

  return NextResponse.json({ ok: true, plan: { goal, steps, context } })
}