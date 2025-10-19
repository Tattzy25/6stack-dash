import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type KpiCardsProps = {
  totalUsers?: number
  imagesGenerated?: number
  activeSessions?: number
  sales?: number
  tokensLeft?: number
  currency?: string
}

export function KpiCards({
  totalUsers = 0,
  imagesGenerated = 0,
  activeSessions = 0,
  sales = 0,
  tokensLeft = 0,
  currency = "USD",
}: KpiCardsProps) {
  const formattedSales = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(sales)

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{totalUsers}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Images Generated</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{imagesGenerated}</CardTitle>
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
          <CardDescription>Sales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{formattedSales}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tokens Left</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{tokensLeft}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}