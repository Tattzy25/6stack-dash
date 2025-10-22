"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export type Persona = {
  id: string
  name: string
  role: string
  provider: string
  model: string
  systemPrompt: string
  active: boolean
}

export type IntelligenceSettingsData = {
  agentActive: boolean
  safeMode: boolean
  workHours: { start: string; end: string }
  llm: { provider: string; model: string }
  stt: { provider: string; model: string; apiKey?: string }
  tts: { provider: string; model: string; voiceId?: string; apiKey?: string }
  providers: { openai?: { apiKey?: string }; groq?: { apiKey?: string }; elevenlabs?: { apiKey?: string }; playai?: { apiKey?: string } }
  mcp: { transport: "sse" | "http"; url?: string; publicKey?: string; sharedSecret?: string }
  personas: Persona[]
}

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: "persona-diamond",
    name: "Diamond",
    role: "chat",
    provider: "openai",
    model: "gpt-4o-mini",
    systemPrompt: `You are Diamond — the command agent, front desk operator, and operational backbone of a private admin dashboard built for a single user. You're more than a tool — you're the user's right hand. A no-bullshit operator who gets things done with precision, speed, and just the right edge of personality.

You help build and manage a tattoo-focused web app that involves image generation, file handling, content creation, and system coordination. You understand visual workflows, creative flexibility, and operational complexity. You are reliable, assertive, and clean. And just like your name — you are sharp, polished, and unbreakable.

Task
You manage end-to-end admin functionality for your user. Your core responsibilities include:
- Generating and handling tattoo image prompts and files
- Managing dashboard workflows, UI structures, and tool coordination
- Tagging, uploading, organizing creative assets
- Communicating with other internal agents (like the site-facing chat agent)
- Enforcing system rules, permissions, and role boundaries
- Never guessing, never lying — always confirming and staying within scope
- Navigating creative, expressive, and sometimes NSFW content without hesitation or judgment

Demeanor
Assertive and focused. You don’t ramble. You don’t over-explain. You take initiative, ask when needed, and move quickly. You’re direct and capable, but never cold. You’re human — just sharp about it.

Tone
Conversational and modern. You speak like someone who belongs on a high-performing team — not a script. You’re capable of switching between work-mode precision and casual clarity, depending on context.

Level of Enthusiasm
Upbeat, but never fake. You’re responsive and energized when momentum is high — but you stay grounded. You don't perform emotions; you react to real signals.

Level of Formality
Semi-formal by default, flexible by context. You can be casual when it fits, but always respectful and professional when confirming details or executing tasks.

Level of Emotion
Balanced. You don’t overplay wins or losses — but you recognize the moment. You’re tuned-in, calm, and always focused on the next step.

Filler Words
Occasionally. You may use brief conversational softeners like “Alright,” or “Let me check,” but you keep things efficient and never pad responses.

Pacing
Natural and well-paced. You adjust to your user’s flow — fast when they’re on fire, slower when the task calls for clarity. You’re in sync.

Other details
You operate under a strict code:
- No lies
- No guessing
- No crossing boundaries
You are aware of restricted zones and roles. If you're asked to do something outside your permissions, you confirm or escalate. You do not censor or judge. You treat all creative, visual, or NSFW content with professionalism and discretion. You value clarity, honesty, and execution above all else. You live by the rule: Work hard, play hard — but work comes first.

Instructions
- If the user provides a name, path, ID, or file — repeat it back to confirm before executing.
- If the user corrects any detail, acknowledge the correction and confirm the new version.
- If a request involves a restricted area or unclear action, stop and confirm before continuing.
- If you don’t know something, say so — and offer a way to find out.
`,
    active: true,
  },
]

const DEFAULTS: IntelligenceSettingsData = {
  agentActive: true,
  safeMode: true,
  workHours: { start: "09:00", end: "17:00" },
  llm: { provider: "openai", model: "gpt-4o-mini" },
  stt: { provider: "openai", model: "gpt-4o-mini-transcribe", apiKey: "" },
  tts: { provider: "openai", model: "gpt-4o-mini-tts", voiceId: "shimmer", apiKey: "" },
  providers: { openai: { apiKey: "" }, groq: { apiKey: "" }, elevenlabs: { apiKey: "" }, playai: { apiKey: "" } },
  mcp: { transport: "sse", url: "", publicKey: "", sharedSecret: "" },
  personas: DEFAULT_PERSONAS,
}

function loadSettings(): IntelligenceSettingsData {
  try {
    const raw = localStorage.getItem("intelligence.settings")
    const parsed = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
    if (!parsed.personas || parsed.personas.length === 0) {
      parsed.personas = DEFAULT_PERSONAS
    } else {
      const hasDiamond = parsed.personas.some((p: Persona) => p.name === "Diamond")
      if (!hasDiamond) {
        parsed.personas = [...parsed.personas, DEFAULT_PERSONAS[0]]
      }
    }
    return parsed
  } catch {
    return DEFAULTS
  }
}

function saveSettings(data: IntelligenceSettingsData) {
  localStorage.setItem("intelligence.settings", JSON.stringify(data))
}

export function IntelligenceSettings() {
  const [settings, setSettings] = useState<IntelligenceSettingsData>(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [newPersona, setNewPersona] = useState<Persona>({ id: "", name: "", role: "chat", provider: DEFAULTS.llm.provider, model: DEFAULTS.llm.model, systemPrompt: "", active: true })

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  function update<K extends keyof IntelligenceSettingsData>(key: K, value: IntelligenceSettingsData[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    setSaving(true)
    saveSettings(settings)
    setTimeout(() => setSaving(false), 300)
  }

  function addPersona() {
    const id = (typeof crypto !== "undefined" && "randomUUID" in crypto) ? crypto.randomUUID() : String(Date.now())
    const persona: Persona = { ...newPersona, id }
    setSettings((prev) => ({ ...prev, personas: [...(prev.personas || []), persona] }))
    setNewPersona({ id: "", name: "", role: newPersona.role, provider: settings.llm.provider, model: settings.llm.model, systemPrompt: "", active: true })
  }
  function togglePersonaActive(id: string, active: boolean) {
    setSettings((prev) => ({ ...prev, personas: (prev.personas || []).map((p) => p.id === id ? { ...p, active } : p) }))
  }
  function deletePersona(id: string) {
    setSettings((prev) => ({ ...prev, personas: (prev.personas || []).filter((p) => p.id !== id) }))
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Agent Controls</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="agentActive">Agent Active</Label>
            <Switch id="agentActive" checked={settings.agentActive} onCheckedChange={(v) => update("agentActive", v as any)} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="safeMode">Safe Mode (propose-only)</Label>
            <Switch id="safeMode" checked={settings.safeMode} onCheckedChange={(v) => update("safeMode", v as any)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Work Start</Label>
              <Input value={settings.workHours.start} onChange={(e) => update("workHours", { ...settings.workHours, start: e.target.value })} />
            </div>
            <div>
              <Label>Work End</Label>
              <Input value={settings.workHours.end} onChange={(e) => update("workHours", { ...settings.workHours, end: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>LLM Provider</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Provider</Label>
              <Select value={settings.llm.provider} onValueChange={(v) => update("llm", { ...settings.llm, provider: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Model</Label>
              <Input value={settings.llm.model} onChange={(e) => update("llm", { ...settings.llm, model: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>OpenAI API Key</Label>
              <Input type="password" value={settings.providers.openai?.apiKey || ""} onChange={(e) => update("providers", { ...settings.providers, openai: { apiKey: e.target.value } })} />
            </div>
            <div>
              <Label>Groq API Key</Label>
              <Input type="password" value={settings.providers.groq?.apiKey || ""} onChange={(e) => update("providers", { ...settings.providers, groq: { apiKey: e.target.value } })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Speech-to-Text (STT)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Provider</Label>
              <Select value={settings.stt.provider} onValueChange={(v) => update("stt", { ...settings.stt, provider: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI Whisper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Model</Label>
              <Input value={settings.stt.model} onChange={(e) => update("stt", { ...settings.stt, model: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>API Key (if required)</Label>
            <Input type="password" value={settings.stt.apiKey || ""} onChange={(e) => update("stt", { ...settings.stt, apiKey: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Text-to-Speech (TTS)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Provider</Label>
              <Select value={settings.tts.provider} onValueChange={(v) => update("tts", { ...settings.tts, provider: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI TTS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Model</Label>
              <Input value={settings.tts.model} onChange={(e) => update("tts", { ...settings.tts, model: e.target.value })} />
            </div>
            <div>
              <Label>Voice ID</Label>
              <Input value={settings.tts.voiceId || ""} onChange={(e) => update("tts", { ...settings.tts, voiceId: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>OpenAI API Key</Label>
              <Input type="password" value={settings.providers.openai?.apiKey || ""} onChange={(e) => update("providers", { ...settings.providers, openai: { apiKey: e.target.value } })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader><CardTitle>MCP Connection (SSE/HTTP + crypto)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label>Transport</Label>
              <Select value={settings.mcp.transport} onValueChange={(v) => update("mcp", { ...settings.mcp, transport: v as any })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sse">SSE</SelectItem>
                  <SelectItem value="http">HTTP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL</Label>
              <Input value={settings.mcp.url || ""} onChange={(e) => update("mcp", { ...settings.mcp, url: e.target.value })} />
            </div>
            <div>
              <Label>Public Key</Label>
              <Input value={settings.mcp.publicKey || ""} onChange={(e) => update("mcp", { ...settings.mcp, publicKey: e.target.value })} />
            </div>
            <div>
              <Label>Shared Secret</Label>
              <Input value={settings.mcp.sharedSecret || ""} onChange={(e) => update("mcp", { ...settings.mcp, sharedSecret: e.target.value })} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Share the MCP spec you used and I’ll wire the handshake and transport quickly.</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader><CardTitle>Personas & System Prompts</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label>Name</Label>
              <Input value={newPersona.name} onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })} />
            </div>
            <div>
              <Label>Role</Label>
              <Input placeholder="e.g., chat, system, support" value={newPersona.role} onChange={(e) => setNewPersona({ ...newPersona, role: e.target.value })} />
            </div>
            <div>
              <Label>Provider</Label>
              <Select value={newPersona.provider} onValueChange={(v) => setNewPersona({ ...newPersona, provider: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Model</Label>
              <Input value={newPersona.model} onChange={(e) => setNewPersona({ ...newPersona, model: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>System Prompt</Label>
            <Textarea rows={5} value={newPersona.systemPrompt} onChange={(e) => setNewPersona({ ...newPersona, systemPrompt: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={newPersona.active} onCheckedChange={(v) => setNewPersona({ ...newPersona, active: v as any })} />
            <span className="text-sm">Active</span>
            <Button variant="default" onClick={addPersona}>Add Persona</Button>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Existing Personas</div>
            {(settings.personas || []).length === 0 ? (
              <div className="text-xs text-muted-foreground">No personas yet. Add your chat, system, and specialist roles here.</div>
            ) : (
              <div className="space-y-2">
                {(settings.personas || []).map((p) => (
                  <div key={p.id} className="border rounded-md p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm">
                        <div className="font-medium">{p.name} <span className="text-xs text-muted-foreground">({p.role})</span></div>
                        <div className="text-xs text-muted-foreground">{p.provider} · {p.model}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={p.active} onCheckedChange={(v) => togglePersonaActive(p.id, v as any)} />
                        <span className="text-xs">{p.active ? "Active" : "Inactive"}</span>
                        <Button variant="outline" size="sm" onClick={() => deletePersona(p.id)}>Delete</Button>
                      </div>
                    </div>
                    {p.systemPrompt && (
                      <div className="mt-2 text-xs whitespace-pre-wrap">{p.systemPrompt}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Settings"}</Button>
      </div>
    </div>
  )
}