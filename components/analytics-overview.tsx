"use client"

import { useEffect, useState } from "react"
import type { AnalyticsOverviewData } from "@/lib/analytics"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KpiCards } from "@/components/kpi-cards"
import { useGlobalControl } from "@/components/global-control-provider"

type AnalyticsState =
  | { status: "loading" }
  | { status: "ready"; data: AnalyticsOverviewData; fetchedAt: string }
  | { status: "error"; message: string }

export function AnalyticsOverview() {
  const { logEvent } = useGlobalControl()
  const [state, setState] = useState<AnalyticsState>({ status: "loading" })

  useEffect(() => {
    let active = true

    const loadAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics/overview", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload = (await response.json()) as { data: AnalyticsOverviewData; fetchedAt: string }

        if (active) {
          setState({ status: "ready", data: payload.data, fetchedAt: payload.fetchedAt })
        }
      } catch (error) {
        if (active) {
          const message = error instanceof Error ? error.message : "Unknown error"
          setState({ status: "error", message })
        }
      }
    }

    loadAnalytics()

    return () => {
      active = false
    }
  }, [])

  function click(name: string) {
    logEvent(`analytics:${name}`)
  }

  const totals = state.status === "ready" ? state.data : undefined

  return (
    <div className="px-4 lg:px-6 grid grid-cols-1 gap-4">
      <KpiCards
        totalKeyholders={totals?.totalKeyholders}
        ideasGenerated={totals?.ideasGenerated}
        contentItems={totals?.contentItems}
        activeSessions={totals?.activeSessions}
        totalRequests={totals?.totalRequests}
        tokensUsed={totals?.tokensUsed}
        currency={totals?.currency}
      />

      {state.status === "loading" && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Loading real analytics</CardTitle>
            <CardDescription>Connecting to the Neon database.</CardDescription>
          </CardHeader>
          <CardContent className="py-4 text-sm text-muted-foreground">
            Fetching live metrics from the backend.
          </CardContent>
        </Card>
      )}

      {state.status === "error" && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Analytics unavailable</CardTitle>
            <CardDescription>We could not load data from the database.</CardDescription>
          </CardHeader>
          <CardContent className="py-4 text-sm text-destructive">
            {state.message}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Usage Reports</CardTitle>
          <CardDescription>Images generated, tokens spent, and more</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => click("usage_export")}>Export Usage</Button>
            <Button variant="outline" onClick={() => click("behavior_view")}>View Behavior Analytics</Button>
            <Button variant="outline" onClick={() => click("popular_view")}>Popular Categories</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>Likes, downloads, shares, and sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => click("engagement_export")}>Export Engagement</Button>
            <Button variant="outline" onClick={() => click("snapshot_generate")}>Generate Snapshot</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
