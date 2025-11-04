"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useGlobalControl } from "@/components/global-control-provider"
import { ActivityFeed, type ActivityItem } from "@/components/activity-feed"

export type ActivityManagerProps = {
  sessions?: { 
    session_id: string; 
    keyholder_id?: string; 
    started_at?: string; 
    status?: string;
    total_requests?: number;
    total_tokens_used?: number;
    recent_requests?: number;
  }[]
  feed?: ActivityItem[]
}

export function ActivityManager({ sessions = [], feed = [] }: ActivityManagerProps) {
  const { logEvent } = useGlobalControl()

  function click(name: string) {
    logEvent(`activity:${name}`)
  }

  const hasSessions = sessions.length > 0

  return (
    <div className="px-4 lg:px-6 grid grid-cols-1 gap-4">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>View current sessions and end if needed</CardDescription>
        </CardHeader>
        <CardContent>
          {hasSessions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sessions.map((s) => (
                <div key={s.session_id} className="border rounded-md p-3">
                  <div className="font-medium">{s.keyholder_id ?? "Anonymous Keyholder"}</div>
                  <div className="text-sm text-muted-foreground">Started: {s.started_at ?? "-"}</div>
                  <div className="text-sm text-muted-foreground">Status: {s.status ?? "-"}</div>
                  <div className="text-sm text-muted-foreground">Requests: {s.total_requests ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Tokens: {s.total_tokens_used ?? 0}</div>
                  <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => click(`session_end:${s.session_id}`)}>End Session</Button>
                      <Button size="sm" variant="outline" onClick={() => click(`session_view:${s.session_id}`)}>View Details</Button>
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border mt-6">
              <EmptyMedia variant="icon" />
              <EmptyHeader>
                <EmptyTitle>No active sessions</EmptyTitle>
                <EmptyDescription>Sessions will appear here when users are online.</EmptyDescription>
              </EmptyHeader>
              <div className="mt-4">
                <Button variant="outline" onClick={() => click("refresh_sessions")}>Refresh</Button>
              </div>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>User Activity</CardTitle>
          <CardDescription>Likes, downloads, saves, and more</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityFeed items={feed} limit={10} />
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => click("activity_refresh")}>Refresh</Button>
            <Button variant="outline" onClick={() => click("activity_export")}>Export</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}