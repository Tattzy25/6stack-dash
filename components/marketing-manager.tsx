"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useGlobalControl } from "@/components/global-control-provider"

export type Campaign = { id: string; name?: string; status?: string }
export type Promo = { id: string; name?: string; active?: boolean }
export type Feedback = { id: string; user?: string; message?: string }

export type MarketingManagerProps = {
  campaigns?: Campaign[]
  promos?: Promo[]
  feedback?: Feedback[]
}

export function MarketingManager({ campaigns = [], promos = [], feedback = [] }: MarketingManagerProps) {
  const { logEvent } = useGlobalControl()

  function click(name: string) {
    logEvent(`marketing:${name}`)
  }

  return (
    <div className="px-4 lg:px-6 grid grid-cols-1 gap-4">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Email Campaigns</CardTitle>
          <CardDescription>Plan and send newsletters</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {campaigns.map((c) => (
                <div key={c.id} className="border rounded-md p-3">
                  <div className="font-medium">{c.name ?? "Campaign"}</div>
                  <div className="text-sm text-muted-foreground">Status: {c.status ?? "-"}</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => click(`campaign_edit:${c.id}`)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => click(`campaign_send:${c.id}`)}>Send</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border mt-6">
              <EmptyMedia variant="icon" />
              <EmptyHeader>
                <EmptyTitle>No campaigns</EmptyTitle>
                <EmptyDescription>Create a campaign to engage users.</EmptyDescription>
              </EmptyHeader>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => click("campaign_create")}>Create Campaign</Button>
                <Button variant="outline" onClick={() => click("campaign_schedule")}>Schedule</Button>
              </div>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Promotions & Discounts</CardTitle>
          <CardDescription>Offer promo codes and deals</CardDescription>
        </CardHeader>
        <CardContent>
          {promos.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {promos.map((p) => (
                <div key={p.id} className="border rounded-md p-3">
                  <div className="font-medium">{p.name ?? "Promotion"}</div>
                  <div className="text-sm text-muted-foreground">Active: {String(p.active ?? false)}</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => click(`promo_edit:${p.id}`)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => click(`promo_toggle:${p.id}`)}>Toggle</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border mt-6">
              <EmptyMedia variant="icon" />
              <EmptyHeader>
                <EmptyTitle>No promotions</EmptyTitle>
                <EmptyDescription>Create a promotion to drive engagement.</EmptyDescription>
              </EmptyHeader>
              <div className="mt-4">
                <Button variant="outline" onClick={() => click("promo_create")}>Create Promotion</Button>
              </div>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>User Feedback</CardTitle>
          <CardDescription>View and respond to feedback</CardDescription>
        </CardHeader>
        <CardContent>
          {feedback.length ? (
            <div className="space-y-3">
              {feedback.map((f) => (
                <div key={f.id} className="border rounded-md p-3">
                  <div className="font-medium">{f.user ?? "Unknown"}</div>
                  <div className="text-sm text-muted-foreground">{f.message ?? ""}</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => click(`feedback_reply:${f.id}`)}>Reply</Button>
                    <Button size="sm" variant="outline" onClick={() => click(`feedback_archive:${f.id}`)}>Archive</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border mt-6">
              <EmptyMedia variant="icon" />
              <EmptyHeader>
                <EmptyTitle>No feedback</EmptyTitle>
                <EmptyDescription>Ask for feedback from users.</EmptyDescription>
              </EmptyHeader>
              <div className="mt-4">
                <Button variant="outline" onClick={() => click("feedback_request")}>Request Feedback</Button>
              </div>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Notification System</CardTitle>
          <CardDescription>Send user notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => click("notif_send_all")}>Send to All</Button>
            <Button variant="outline" onClick={() => click("notif_test")}>Send Test</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}