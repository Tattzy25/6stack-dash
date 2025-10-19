"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KpiCards } from "@/components/kpi-cards"
import { useGlobalControl } from "@/components/global-control-provider"

export type AnalyticsOverviewProps = {
  currency?: string
}

export function AnalyticsOverview({ currency = "USD" }: AnalyticsOverviewProps) {
  const { logEvent } = useGlobalControl()

  function click(name: string) {
    logEvent(`analytics:${name}`)
  }

  return (
    <div className="px-4 lg:px-6 grid grid-cols-1 gap-4">
      <KpiCards currency={currency} />

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