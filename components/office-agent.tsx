"use client"

import React, { useMemo, useRef, useState, useEffect } from "react"
import { useGlobalControl } from "@/components/global-control-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconPlayerPlay,
  IconPlayerStop,
  IconRobot,
  IconMessage,
  IconFilePlus,
  IconUpload,
  IconSettings,
  IconShieldHalf,
  IconBolt,
  IconCircleCheck,
  IconCircleX,
  IconArrowRight,
  IconLink,
} from "@tabler/icons-react"


// Allowed tools registry (MVP/stub). In production this can be fetched from backend or SQL.
const DEFAULT_ALLOWED_TOOLS = [
  { id: "search_codebase", name: "Search Codebase", enabled: true, description: "Search files and symbols" },
  { id: "read_files", name: "Read Files", enabled: true, description: "View file contents safely" },
  { id: "propose_edits", name: "Propose Code Edits", enabled: true, description: "Prepare diffs for approval" },
  { id: "pages_manager", name: "Pages Manager Actions", enabled: true, description: "Create/update pages and sections" },
  { id: "cms_actions", name: "CMS Actions", enabled: true, description: "Update static content" },
  { id: "media_upload", name: "Media Upload", enabled: true, description: "Upload images and assets" },
  { id: "fetch_http", name: "HTTP Fetch", enabled: true, description: "Call external APIs" },
  { id: "db_access", name: "Database Access", enabled: false, description: "Query/update SQL (requires RLS)" },
  { id: "shell_commands", name: "Shell Commands", enabled: false, description: "Run commands (approval required)" },
]

// Work schedule toggles (simple MVP; move to SQL later)
function isWorkHours(now: Date, hours: { start: number; end: number }) {
  const h = now.getHours()
  return h >= hours.start && h < hours.end
}

export function OfficeAgent() {
  const { logEvent } = useGlobalControl()
  const [messages, setMessages] = useState<Array<{ role: "user" | "agent"; text: string }>>([])
  const [input, setInput] = useState("")
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [allowedTools, setAllowedTools] = useState(DEFAULT_ALLOWED_TOOLS)
  const [safeMode, setSafeMode] = useState(true)
  const [workEnabled, setWorkEnabled] = useState(true)
  const [workHours, setWorkHours] = useState({ start: 8, end: 20 }) // 8am-8pm default
  const [pendingPlan, setPendingPlan] = useState<string[]>([])
  const [approved, setApproved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const mediaRecorderRef = useRef<any>(null)
  const audioChunksRef = useRef<any[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [settings, setSettings] = useState<any>(null)
  const [voiceAuto, setVoiceAuto] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("intelligence.settings")
      if (raw) {
        const parsed = JSON.parse(raw)
        setSettings(parsed)
        if (typeof parsed.safeMode === "boolean") setSafeMode(parsed.safeMode)
        const startHour = Number(parsed?.workHours?.start?.split(":")[0]) || 8
        const endHour = Number(parsed?.workHours?.end?.split(":")[0]) || 20
        setWorkHours({ start: startHour, end: endHour })
      }
    } catch {}
  }, [])
  const activeTools = useMemo(() => allowedTools.filter((t) => t.enabled), [allowedTools])
  const canOperateNow = workEnabled && isWorkHours(new Date(), workHours)
  const activePersona = useMemo(() => {
    try {
      const personas = settings?.personas || []
      return personas.find((p: any) => p?.active) ?? null
    } catch {
      return null
    }
  }, [settings])

  function append(role: "user" | "agent", text: string) {
    setMessages((m) => [...m, { role, text }])
  }

  // Safer Blob -> base64 conversion to avoid stack overflow
  async function blobToBase64Safe(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        try {
          const dataUrl = reader.result as string
          const base64 = (dataUrl?.split(",")[1]) || ""
          resolve(base64)
        } catch (e) {
          reject(e)
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  }

  async function callChatLLM(userText: string) {
    try {
      const provider = settings?.llm?.provider || "groq"
      const model = settings?.llm?.model || "openai/gpt-oss-120b"
      const apiKey = provider === "groq" ? settings?.providers?.groq?.apiKey : settings?.providers?.openai?.apiKey
      const systemPrompt = activePersona?.systemPrompt || "You are a helpful office agent."
      const payload = {
        provider,
        model,
        apiKey,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })).concat([{ role: "user", content: userText }]),
      }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data?.ok && data?.text) {
        append("agent", data.text)
      } else {
        append("agent", `Chat failed: ${data?.error || "unknown"}`)
      }
    } catch (err: any) {
      append("agent", `Chat error: ${err?.message || err}`)
    }
  }

  function handleSend() {
    const text = input.trim()
    if (!text) return
    append("user", text)
    logEvent("office:command", text)

    // Very simple planning stub. In production, call planner/LLM with tools context.
    const plan: string[] = []
    if (/upload|image|file/i.test(text)) plan.push("Upload media assets")
    if (/page|section|content/i.test(text)) plan.push("Update Pages/CMS content")
    if (/code|fix|refactor|route|component/i.test(text)) plan.push("Prepare code edit diffs")
    if (/fetch|api|http/i.test(text)) plan.push("Fetch external data via HTTP")
    if (/notify|email|newsletter|marketing/i.test(text)) plan.push("Compose and schedule marketing content")

    // Only show approvals UI when there are actionable steps.
    const actionablePlan = plan.filter((s) => s.trim().length > 0)
    if (actionablePlan.length > 0) {
      setPendingPlan(actionablePlan)
      setApproved(false)
      append("agent", `Proposed plan (awaiting approval):\n- ${actionablePlan.join("\n- ")}`)
    }

    // Send to LLM provider for actual reply
    callChatLLM(text)
    setInput("")
  }

  function toggleTool(id: string, enabled: boolean) {
    setAllowedTools((tools) => tools.map((t) => (t.id === id ? { ...t, enabled } : t)))
    logEvent("office:tool_toggle", `${id}:${enabled ? "on" : "off"}`)
  }

  function handleApprove() {
    setApproved(true)
    logEvent("office:approved", pendingPlan.join(" | "))
    append("agent", "Approval received. Executing the plan with safe mode checks.")

    // Execute stub: Just log steps. Real execution will route to tool gateway.
    pendingPlan.forEach((step) => {
      logEvent("office:execute", step)
    })
    append("agent", "Execution complete (MVP stub). Tools and writes are gated.")
    setPendingPlan([])
  }

  function handleUploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const names = Array.from(files).map((f) => f.name).join(", ")
    logEvent("office:upload", names)
    append("agent", `Queued upload: ${names}`)
  }

  function startListening() {
    setListening(true)
    logEvent("office:stt_start", "start")
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      audioChunksRef.current = []
      mr.ondataavailable = (e: any) => { if (e.data?.size > 0) audioChunksRef.current.push(e.data) }
      mr.onstart = () => append("agent", "Listening via OpenAI (recording)…")
      mr.start()
    }).catch((err) => {
      append("agent", `Microphone error: ${err?.message || err}`)
    })
  }
  function stopListening() {
    setListening(false)
    logEvent("office:stt_stop", "stop")
    const mr = mediaRecorderRef.current
    if (mr) {
      mr.onstop = async () => {
        try {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
          const base64 = await blobToBase64Safe(blob)
          const res = await fetch("/api/stt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider: "openai", model: settings?.stt?.model || "gpt-4o-mini-transcribe", audioBase64: base64 }),
          })
          const data = await res.json()
          if (data?.ok && data?.text) {
            append("user", data.text)
          } else {
            append("agent", `STT failed: ${data?.error || "unknown"}`)
          }
        } catch (err: any) {
          append("agent", `STT error: ${err?.message || err}`)
        } finally {
          audioChunksRef.current = []
        }
      }
      try { mr.stop() } catch {}
      mediaRecorderRef.current = null
    }
  }
  function startSpeaking() {
    setSpeaking(true)
    logEvent("office:tts_start", "start")
    const lastAgentMsg = [...messages].reverse().find((m) => m.role === "agent")?.text || "Hello."
    ;(async () => {
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: "openai", model: settings?.tts?.model || "gpt-4o-mini-tts", voiceId: "shimmer", text: lastAgentMsg, format: "mp3" }),
        })
        const data = await res.json()
        if (data?.ok && data?.audioBase64) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`)
          audioRef.current = audio
          audio.play().catch(() => {})
          append("agent", data?.provider?.includes("elevenlabs") ? "Speaking via ElevenLabs (fallback)…" : "Speaking via OpenAI TTS (Shimmer)…")
        } else {
          append("agent", `TTS failed: ${data?.error || "unknown"}`)
        }
      } catch (err: any) {
        append("agent", `TTS error: ${err?.message || err}`)
      }
    })()
  }
  function stopSpeaking() {
    setSpeaking(false)
    logEvent("office:tts_stop", "stop")
    const audio = audioRef.current
    if (audio) {
      try { audio.pause(); audio.currentTime = 0 } catch {}
      audioRef.current = null
    }
  }

  function beginVoiceAuto() {
    setVoiceAuto(true)
    // Setup audio stream + analyser for simple VAD
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      streamRef.current = stream
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      audioChunksRef.current = []
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyserRef.current = analyser
      source.connect(analyser)

      let speakingDetected = false
      let lastActive = Date.now()
      const silenceMs = 1500
      const threshold = 0.02 // simple RMS threshold

      const monitor = () => {
        const buf = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / buf.length)
        const now = Date.now()
        if (rms > threshold) {
          speakingDetected = true
          lastActive = now
        }
        if (speakingDetected && now - lastActive > silenceMs) {
          try { mr.stop() } catch {}
        } else {
          if (voiceAuto && mr.state === "recording") requestAnimationFrame(monitor)
        }
      }

      mr.onstart = () => {
        setListening(true)
        append("agent", "Listening (hands-free)…")
        requestAnimationFrame(monitor)
      }
      mr.ondataavailable = (e: any) => { if (e.data?.size > 0) audioChunksRef.current.push(e.data) }
      mr.onstop = async () => {
        setListening(false)
        // Tear down analyser and stream tracks
        try { analyser.disconnect() } catch {}
        try { source.disconnect() } catch {}
        try { ctx.close() } catch {}
        audioCtxRef.current = null
        analyserRef.current = null
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
          streamRef.current = null
        }
        try {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
          const base64 = await blobToBase64Safe(blob)
          const res = await fetch("/api/stt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider: "openai", model: settings?.stt?.model || "gpt-4o-mini-transcribe", audioBase64: base64 }),
          })
          const data = await res.json()
          if (data?.ok && data?.text) {
            append("user", data.text)
            await callChatLLM(data.text)
            // Auto speak the latest reply
            const lastAgentMsg = [...messages, { role: "user", text: data.text }].reverse().find((m) => m.role === "agent")?.text
            // Start speaking and when ended, loop if auto
            ;(async () => {
              try {
                const speakRes = await fetch("/api/tts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ provider: "openai", model: settings?.tts?.model || "gpt-4o-mini-tts", voiceId: "shimmer", text: lastAgentMsg || "", format: "mp3" }),
                })
                const speakData = await speakRes.json()
                if (speakData?.ok && speakData?.audioBase64) {
                  const audio = new Audio(`data:audio/mp3;base64,${speakData.audioBase64}`)
                  audioRef.current = audio
                  audio.onended = () => {
                    audioRef.current = null
                    if (voiceAuto) beginVoiceAuto()
                  }
                  audio.play().catch(() => {})
                }
              } catch {}
            })()
          } else {
            append("agent", `STT failed: ${data?.error || "unknown"}`)
          }
        } catch (err: any) {
          append("agent", `STT error: ${err?.message || err}`)
        } finally {
          audioChunksRef.current = []
        }
      }

      mr.start()
    }).catch((err) => {
      append("agent", `Microphone error: ${err?.message || err}`)
      setVoiceAuto(false)
    })
  }

  function endVoiceAuto() {
    setVoiceAuto(false)
    setListening(false)
    try { mediaRecorderRef.current?.stop() } catch {}
    mediaRecorderRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close() } catch {}
      audioCtxRef.current = null
    }
    stopSpeaking()
  }
  function escalateToWebsiteAgent() {
    logEvent("office:escalate", "bridge_request")
    append(
      "agent",
      "Escalation sent to Website Agent (MVP stub). In production this uses a WebSocket/SSE bridge with correlation IDs."
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Chat and Controls */}
      <Card className="lg:col-span-2">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <IconRobot className="size-5" /> Office Agent
          </CardTitle>
          <CardDescription>Front desk assistant for ops, content, and code tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={canOperateNow ? "default" : "outline"}>
              {canOperateNow ? "Within Work Hours" : "Outside Work Hours"}
            </Badge>
            {safeMode ? (
              <Badge variant="outline" className="flex items-center gap-1"><IconShieldHalf className="size-4" /> Safe Mode</Badge>
            ) : (
              <Badge variant="destructive">Unsafe</Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1"><IconBolt className="size-4" /> Tools: {activeTools.length}</Badge>
            <Badge variant="outline" className="flex items-center gap-1"><IconMessage className="size-4" /> Persona: {activePersona ? activePersona.name : "Default"}</Badge>
          </div>

          {/* Messages */}
          <div className="border rounded-md p-3 h-64 overflow-auto bg-muted/20">
            {messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">No messages yet. Describe what you want: e.g., "Create a new image generator page with a gallery and embed."</div>
            ) : (
              <div className="space-y-2">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "text-sm" : "text-sm text-muted-foreground"}>
                    <strong>{m.role === "user" ? "You" : "Office"}:</strong> {m.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type a long-form instruction…"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleSend} className="gap-1">
              <IconMessage className="size-4" /> Send
            </Button>
            <Button variant={voiceAuto ? "secondary" : "outline"} onClick={voiceAuto ? endVoiceAuto : beginVoiceAuto} className="gap-1">
              {voiceAuto ? <IconMicrophoneOff className="size-4" /> : <IconMicrophone className="size-4" />} {voiceAuto ? "Touchless: ON" : "Touchless Voice"}
            </Button>
            <Button variant={speaking ? "secondary" : "outline"} onClick={speaking ? stopSpeaking : startSpeaking} className="gap-1">
              {speaking ? <IconPlayerStop className="size-4" /> : <IconPlayerPlay className="size-4" />} {speaking ? "Stop" : "Speak"}
            </Button>
            <Button variant="outline" className="gap-1" onClick={escalateToWebsiteAgent}>
              <IconLink className="size-4" /> Escalate to Website Agent
            </Button>
          </div>

          <Separator className="my-2" />

          {/* File Upload */}
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2"><IconUpload className="size-4" /> Upload files</div>
            <Input type="file" multiple ref={fileInputRef} onChange={(e) => handleUploadFiles(e.target.files)} />
            <div className="text-xs text-muted-foreground">Images, documents. Processing is gated by approvals.</div>
          </div>

          {/* Pending Plan + Approvals */}
          {pendingPlan.length > 0 && (
            <div className="rounded-md border p-3 bg-accent/10">
              <div className="font-medium mb-2 flex items-center gap-2"><IconSettings className="size-4" /> Planned Steps</div>
              <ol className="list-decimal ml-5 text-sm">
                {pendingPlan.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button variant="default" onClick={handleApprove} className="gap-1">
                  <IconCircleCheck className="size-4" /> Approve & Execute
                </Button>
                <Button variant="outline" onClick={() => setPendingPlan([])} className="gap-1">
                  <IconCircleX className="size-4" /> Reject
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tools & Settings */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2"><IconFilePlus className="size-5" /> Tools & Settings</CardTitle>
          <CardDescription>Allowed tools, safe mode, and schedule</CardDescription>
        </CardHeader>
        <CardContent className="py-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant={safeMode ? "default" : "outline"} onClick={() => { setSafeMode(!safeMode); logEvent("office:safe_mode", safeMode ? "off" : "on") }} className="gap-1">
              <IconShieldHalf className="size-4" /> {safeMode ? "Safe Mode: ON" : "Safe Mode: OFF"}
            </Button>
            <Button size="sm" variant={workEnabled ? "default" : "outline"} onClick={() => { setWorkEnabled(!workEnabled); logEvent("office:work_enabled", workEnabled ? "off" : "on") }} className="gap-1">
              <IconBolt className="size-4" /> {workEnabled ? "Work Enabled" : "Work Disabled"}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Allowed Tools</div>
            <div className="space-y-1">
              {allowedTools.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={t.enabled}
                    onChange={(e) => toggleTool(t.id, e.target.checked)}
                  />
                  <span>{t.name}</span>
                  <span className="text-muted-foreground">– {t.description}</span>
                </label>
              ))}
            </div>
          </div>

          <Separator />
          <div className="space-y-2">
            <div className="text-sm font-medium">Bridge & Integrations</div>
            <div className="text-xs text-muted-foreground">
              Agent bridge uses WebSocket/SSE with RLS and correlation IDs.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}