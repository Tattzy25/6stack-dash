"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useGlobalControl } from "@/components/global-control-provider"
import {
  PagesConfig,
  PageEntry,
  PageSection,
  SectionType,
  loadPagesConfig,
  savePagesConfig,
} from "@/lib/pages-config"

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`
}

function sanitizeHtml(html: string): string {
  let out = html || ""
  // Remove script tags
  out = out.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
  // Remove inline event handlers like onclick="..."
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
  // Neutralize javascript: URLs
  out = out.replace(/(href|src)\s*=\s*("|')\s*javascript:[\s\S]*?("|')/gi, "$1='#'")
  return out
}

type ThemeVars = {
  primary?: string
  background?: string
  text?: string
  accent?: string
}

type ExtPageEntry = PageEntry & { theme?: ThemeVars }

type GallerySection = PageSection & { images?: string[] }

type EmbedSection = PageSection & { embedHtml?: string }

type TextSection = PageSection & { headline?: string; content?: string }

export function PagesManager() {
  const { logEvent } = useGlobalControl()
  const [config, setConfig] = useState<PagesConfig | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [importJson, setImportJson] = useState<string>("")

  useEffect(() => {
    const loaded = loadPagesConfig()
    setConfig(loaded)
    if (loaded.pages.length > 0) setSelectedId(loaded.pages[0].id)
  }, [])

  const selectedPage = useMemo(() => {
    return config?.pages.find((p) => p.id === selectedId) as ExtPageEntry | undefined
  }, [config, selectedId])

  function persist(next: PagesConfig) {
    setConfig(next)
    savePagesConfig(next)
  }

  function addPage() {
    if (!config) return
    const newPage: ExtPageEntry = {
      id: uid("page"),
      title: "New Generated Page",
      slug: `/generated-${Math.random().toString(36).slice(2, 6)}`,
      status: "draft",
      sections: [],
      theme: { primary: "#4f46e5", background: "#0b132b", text: "#e6e6e6", accent: "#22d3ee" },
    }
    const next = { ...config, pages: [newPage, ...config.pages] }
    persist(next)
    setSelectedId(newPage.id)
    logEvent({ type: "pages:add", payload: { id: newPage.id, title: newPage.title } })
  }

  function deletePage(id: string) {
    if (!config) return
    const next = { ...config, pages: config.pages.filter((p) => p.id !== id) }
    persist(next)
    if (selectedId === id) setSelectedId(next.pages[0]?.id ?? null)
    logEvent({ type: "pages:delete", payload: { id } })
  }

  function updatePageMeta<K extends keyof ExtPageEntry>(key: K, value: ExtPageEntry[K]) {
    if (!config || !selectedPage) return
    const nextPages = config.pages.map((p) => (p.id === selectedPage.id ? { ...p, [key]: value } : p))
    const next = { ...config, pages: nextPages }
    persist(next)
    logEvent({ type: "pages:update_meta", payload: { id: selectedPage.id, key } })
  }

  function addSection(type: SectionType) {
    if (!config || !selectedPage) return
    const base: PageSection = { id: uid("sec"), type }
    let section: PageSection
    if (type === "text") {
      section = { ...base, headline: "Headline", content: "Describe your generator here." } as TextSection
    } else if (type === "gallery") {
      section = { ...base, images: [] } as GallerySection
    } else {
      section = { ...base, embedHtml: "<div>Paste safe embed HTML</div>" } as EmbedSection
    }
    const nextPages = config.pages.map((p) => (p.id === selectedPage.id ? { ...p, sections: [...p.sections, section] } : p))
    persist({ ...config, pages: nextPages })
    logEvent({ type: "pages:add_section", payload: { pageId: selectedPage.id, sectionType: type } })
  }

  function updateSection(sectionId: string, updates: Partial<PageSection>) {
    if (!config || !selectedPage) return
    const nextPages = config.pages.map((p) => {
      if (p.id !== selectedPage.id) return p
      const sections = p.sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
      return { ...p, sections }
    })
    persist({ ...config, pages: nextPages })
    logEvent({ type: "pages:update_section", payload: { pageId: selectedPage.id, sectionId } })
  }

  function removeSection(sectionId: string) {
    if (!config || !selectedPage) return
    const nextPages = config.pages.map((p) => {
      if (p.id !== selectedPage.id) return p
      const sections = p.sections.filter((s) => s.id !== sectionId)
      return { ...p, sections }
    })
    persist({ ...config, pages: nextPages })
    logEvent({ type: "pages:remove_section", payload: { pageId: selectedPage.id, sectionId } })
  }

  function exportConfig() {
    if (!config) return
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pages-config.json"
    a.click()
    URL.revokeObjectURL(url)
    logEvent({ type: "pages:export_config", payload: { count: config.pages.length } })
  }

  function importFromJson() {
    try {
      const parsed = JSON.parse(importJson) as PagesConfig
      persist(parsed)
      setSelectedId(parsed.pages[0]?.id ?? null)
      logEvent({ type: "pages:import_config", payload: { count: parsed.pages.length } })
    } catch (e) {
      logEvent({ type: "pages:import_error", payload: { error: String(e) } })
    }
  }

  function applyTheme(vars: ThemeVars) {
    updatePageMeta("theme", { ...(selectedPage?.theme ?? {}), ...vars })
    logEvent({ type: "pages:apply_theme", payload: { pageId: selectedPage?.id } })
  }

  if (!config) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Pages Manager</CardTitle>
            <CardDescription>Loading configuration…</CardDescription>
          </CardHeader>
          <CardContent className="py-4">Please wait.</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Left: Pages List & Actions */}
      <Card className="lg:col-span-1">
        <CardHeader className="border-b">
          <CardTitle>Generated Pages</CardTitle>
          <CardDescription>Create, select, and delete pages</CardDescription>
        </CardHeader>
        <CardContent className="py-4 space-y-3">
          <div className="flex gap-2">
            <Button onClick={addPage}>Add Page</Button>
            <Button variant="outline" onClick={exportConfig}>Export JSON</Button>
          </div>
          <div className="space-y-2">
            {config.pages.length === 0 && (
              <div className="text-sm text-muted-foreground">No generated pages yet.</div>
            )}
            {config.pages.map((p) => (
              <div key={p.id} className={`flex items-center justify-between gap-2 p-2 rounded border ${selectedId === p.id ? "bg-accent" : ""}`}>
                <button className="text-left flex-1" onClick={() => setSelectedId(p.id)}>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.slug} · {p.status}</div>
                </button>
                <Button size="sm" variant="outline" onClick={() => deletePage(p.id)}>Delete</Button>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Textarea value={importJson} onChange={(e) => setImportJson(e.target.value)} placeholder="Paste JSON to import configuration" />
            <Button variant="outline" onClick={importFromJson}>Import JSON</Button>
          </div>
        </CardContent>
      </Card>

      {/* Middle: Page Editor */}
      <Card className="lg:col-span-1">
        <CardHeader className="border-b">
          <CardTitle>Page Editor</CardTitle>
          <CardDescription>Update meta and sections for the selected page</CardDescription>
        </CardHeader>
        <CardContent className="py-4 space-y-4">
          {!selectedPage && (
            <div className="text-sm text-muted-foreground">Select a page to edit.</div>
          )}

          {selectedPage && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Title</label>
                  <Input value={selectedPage.title} onChange={(e) => updatePageMeta("title", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Slug</label>
                  <Input value={selectedPage.slug} onChange={(e) => updatePageMeta("slug", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <label className="text-xs text-muted-foreground col-span-3">Add Section</label>
                <Button variant="outline" onClick={() => addSection("text")}>Text</Button>
                <Button variant="outline" onClick={() => addSection("gallery")}>Gallery</Button>
                <Button variant="outline" onClick={() => addSection("embed")}>Embed</Button>
              </div>

              <div className="space-y-3">
                {selectedPage.sections.length === 0 && (
                  <div className="text-xs text-muted-foreground">No sections yet. Add one above.</div>
                )}
                {selectedPage.sections.map((sec) => (
                  <div key={sec.id} className="border rounded p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium uppercase">{sec.type}</div>
                      <Button size="sm" variant="outline" onClick={() => removeSection(sec.id)}>Remove</Button>
                    </div>

                    {sec.type === "text" && (
                      <div className="space-y-2">
                        <Input
                          value={(sec as TextSection).headline ?? ""}
                          onChange={(e) => updateSection(sec.id, { headline: e.target.value })}
                          placeholder="Headline"
                        />
                        <Textarea
                          value={(sec as TextSection).content ?? ""}
                          onChange={(e) => updateSection(sec.id, { content: e.target.value })}
                          placeholder="Content"
                        />
                      </div>
                    )}

                    {sec.type === "gallery" && (
                      <GalleryEditor section={sec as GallerySection} onChange={(updates) => updateSection(sec.id, updates)} />
                    )}

                    {sec.type === "embed" && (
                      <div className="space-y-2">
                        <Textarea
                          value={(sec as EmbedSection).embedHtml ?? ""}
                          onChange={(e) => updateSection(sec.id, { embedHtml: e.target.value })}
                          placeholder="Embed HTML (iframes or safe widgets)"
                        />
                        <div className="text-xs text-muted-foreground">Scripts and event handlers are stripped automatically.</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right: Theme + Live Preview */}
      <Card className="lg:col-span-1">
        <CardHeader className="border-b">
          <CardTitle>Theme & Preview</CardTitle>
          <CardDescription>Adjust colors and preview the page</CardDescription>
        </CardHeader>
        <CardContent className="py-4 space-y-3">
          {selectedPage && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Primary</label>
                  <Input
                    type="color"
                    value={selectedPage.theme?.primary ?? "#4f46e5"}
                    onChange={(e) => applyTheme({ primary: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Accent</label>
                  <Input
                    type="color"
                    value={selectedPage.theme?.accent ?? "#22d3ee"}
                    onChange={(e) => applyTheme({ accent: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Background</label>
                  <Input
                    type="color"
                    value={selectedPage.theme?.background ?? "#0b132b"}
                    onChange={(e) => applyTheme({ background: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Text</label>
                  <Input
                    type="color"
                    value={selectedPage.theme?.text ?? "#e6e6e6"}
                    onChange={(e) => applyTheme({ text: e.target.value })}
                  />
                </div>
              </div>

              <div
                className="rounded border p-3 space-y-3"
                style={{
                  // Apply CSS variables to preview container
                  // @ts-ignore - CSS var names
                  "--pm-primary": selectedPage.theme?.primary ?? "#4f46e5",
                  "--pm-accent": selectedPage.theme?.accent ?? "#22d3ee",
                  "--pm-bg": selectedPage.theme?.background ?? "#0b132b",
                  "--pm-text": selectedPage.theme?.text ?? "#e6e6e6",
                  backgroundColor: "var(--pm-bg)",
                  color: "var(--pm-text)",
                } as React.CSSProperties}
              >
                <div style={{ color: "var(--pm-primary)", fontWeight: 700, fontSize: "1.1rem" }}>{selectedPage.title}</div>
                {selectedPage.sections.map((sec) => (
                  <div key={sec.id} className="rounded bg-black/10 p-2">
                    {sec.type === "text" && (
                      <div>
                        <div style={{ color: "var(--pm-primary)", fontWeight: 600 }}>{(sec as TextSection).headline}</div>
                        <p className="text-sm">{(sec as TextSection).content}</p>
                      </div>
                    )}
                    {sec.type === "gallery" && (
                      <div className="grid grid-cols-3 gap-2">
                        {(sec as GallerySection).images?.map((url, i) => (
                          <img key={i} src={url} alt="gallery" className="w-full h-20 object-cover rounded" />
                        ))}
                        {((sec as GallerySection).images?.length ?? 0) === 0 && (
                          <div className="text-xs text-muted-foreground">No images added.</div>
                        )}
                      </div>
                    )}
                    {sec.type === "embed" && (
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml((sec as EmbedSection).embedHtml ?? "") }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {!selectedPage && <div className="text-sm text-muted-foreground">Select a page to preview.</div>}
        </CardContent>
      </Card>
    </div>
  )
}

function GalleryEditor({ section, onChange }: { section: GallerySection; onChange: (updates: Partial<GallerySection>) => void }) {
  const { logEvent } = useGlobalControl()
  const [newUrl, setNewUrl] = useState<string>("")

  function addUrl() {
    const images = [...(section.images ?? [])]
    const url = newUrl.trim()
    if (!url) return
    images.push(url)
    onChange({ images })
    setNewUrl("")
    logEvent({ type: "pages:gallery_add", payload: { sectionId: section.id, url } })
  }

  function removeUrl(idx: number) {
    const images = [...(section.images ?? [])]
    const [removed] = images.splice(idx, 1)
    onChange({ images })
    logEvent({ type: "pages:gallery_remove", payload: { sectionId: section.id, url: removed } })
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Image URL" />
        <Button size="sm" variant="outline" onClick={addUrl}>Add URL</Button>
      </div>
      <div className="space-y-1">
        {(section.images ?? []).map((url, idx) => (
          <div key={`${url}_${idx}`} className="flex items-center justify-between gap-2">
            <span className="text-xs truncate max-w-[60%]">{url}</span>
            <Button size="sm" variant="outline" onClick={() => removeUrl(idx)}>Remove</Button>
          </div>
        ))}
        {((section.images ?? []).length === 0) && (
          <div className="text-xs text-muted-foreground">No image URLs added.</div>
        )}
      </div>
    </div>
  )
}