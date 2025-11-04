import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type KpiCardsProps = {
  totalKeyholders?: number
  ideasGenerated?: number
  contentItems?: number
  activeSessions?: number
  totalRequests?: number
  tokensUsed?: number
  currency?: string
}

export function KpiCards({
  totalKeyholders = 0,
  ideasGenerated = 0,
  contentItems = 0,
  activeSessions = 0,
  totalRequests = 0,
  tokensUsed = 0,
  currency = "USD",
}: KpiCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 @7xl/main:grid-cols-6">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Keyholders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{totalKeyholders}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ideas Generated</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{ideasGenerated}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Content Items</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{contentItems}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Sessions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{activeSessions}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Requests</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{totalRequests}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tokens Used</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{tokensUsed}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}