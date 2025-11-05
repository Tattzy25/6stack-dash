"use client"

import { useEffect, useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { LogsTable, type LogItem } from "@/components/logs-table"

export default function ActivityPage() {
  const [items, setItems] = useState<LogItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/analytics/activity")
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        const json = await res.json()
        const raw = (json?.data ?? []) as any[]
        const mapped: LogItem[] = raw.map((item) => ({
          time: item?.timestamp ?? "",
          user: item?.keyholder ?? "Anonymous",
          action: item?.details ?? item?.type ?? "",
          target: item?.metadata?.action_type ?? item?.metadata?.session_id ?? undefined,
        }))
        if (!cancelled) setItems(mapped)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load activity")
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Session & Activity Logs" />
        <div className="flex-1 flex flex-col gap-4 p-4">
          <LogsTable items={items} title="Recent Activity" description={error ? `Error: ${error}` : "Last 50 events"} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}