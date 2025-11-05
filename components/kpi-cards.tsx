import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type KpiCardsProps = {
  totalKeyholders?: number
  ideasGenerated?: number
  contentItems?: number
  activeSessions?: number
  totalRequests?: number
  tokensUsed?: number
  costUsd?: number
  currency?: string
}

export function KpiCards({
  totalKeyholders = 0,
  ideasGenerated = 0,
  contentItems = 0,
  activeSessions = 0,
  totalRequests = 0,
  tokensUsed = 0,
  costUsd = 0,
  currency = "USD",
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 px-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Keyholders</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">{Number(totalKeyholders).toLocaleString()}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ideas Generated</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">{Number(ideasGenerated).toLocaleString()}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Content Items</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">{Number(contentItems).toLocaleString()}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Sessions</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">{Number(activeSessions).toLocaleString()}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Requests</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">{Number(totalRequests).toLocaleString()}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tokens Used</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">{Number(tokensUsed).toLocaleString()}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Cost ({currency})</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">{Number(costUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}