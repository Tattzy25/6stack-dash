"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGlobalControl } from "@/components/global-control-provider"

export function ReportsManager() {
  const { logEvent } = useGlobalControl()

  function click(name: string) {
    logEvent(`reports:${name}`)
  }

  return (
    <div className="px-4 lg:px-6 grid grid-cols-1 gap-4">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Download Data Reports</CardTitle>
          <CardDescription>Export different datasets</CardDescription>
        </CardHeader>
        <CardContent className="py-4 flex gap-2">
          <Button variant="outline" onClick={() => click("download_users")}>Download Users</Button>
          <Button variant="outline" onClick={() => click("download_activity")}>Download Activity Logs</Button>
          <Button variant="outline" onClick={() => click("download_transactions")}>Download Transactions</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Export User Data or Logs</CardTitle>
          <CardDescription>CSV, JSON, or PDF</CardDescription>
        </CardHeader>
        <CardContent className="py-4 flex gap-2">
          <Button variant="outline" onClick={() => click("export_users_csv")}>Export Users (CSV)</Button>
          <Button variant="outline" onClick={() => click("export_logs_json")}>Export Logs (JSON)</Button>
          <Button variant="outline" onClick={() => click("export_analytics_pdf")}>Analytics Snapshot (PDF)</Button>
        </CardContent>
      </Card>
    </div>
  )
}