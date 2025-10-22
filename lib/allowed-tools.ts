export type ToolPolicy = {
  id: string
  description: string
  rolesAllowed: string[]
  approvalRequired: boolean
  rateLimit: { limit: number; windowSec: number }
  execution: "vercel" | "sandbox" | "local"
}

export const ALLOWED_TOOLS: ToolPolicy[] = [
  {
    id: "fs.read",
    description: "Read files from the repo within allowed paths",
    rolesAllowed: ["owner", "assistant", "content"],
    approvalRequired: false,
    rateLimit: { limit: 30, windowSec: 60 },
    execution: "local",
  },
  {
    id: "code.proposeEdit",
    description: "Propose code edits with diffs and apply after approval",
    rolesAllowed: ["owner", "assistant"],
    approvalRequired: true,
    rateLimit: { limit: 10, windowSec: 60 },
    execution: "sandbox",
  },
  {
    id: "cms.createPost",
    description: "Create a post via CMS API",
    rolesAllowed: ["marketing", "owner"],
    approvalRequired: true,
    rateLimit: { limit: 5, windowSec: 60 },
    execution: "vercel",
  },
  {
    id: "bridge.message",
    description: "Send a message to the website agent",
    rolesAllowed: ["owner", "assistant"],
    approvalRequired: false,
    rateLimit: { limit: 20, windowSec: 60 },
    execution: "vercel",
  },
]

export function isAllowed(toolId: string, role: string) {
  const policy = ALLOWED_TOOLS.find((t) => t.id === toolId)
  if (!policy) return false
  return policy.rolesAllowed.includes(role)
}

export function getPolicy(toolId: string): ToolPolicy | undefined {
  return ALLOWED_TOOLS.find((t) => t.id === toolId)
}

export function requiresApproval(toolId: string): boolean {
  const p = getPolicy(toolId)
  return !!p?.approvalRequired
}