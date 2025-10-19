import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type ActivityItem = {
  time: string
  user: string
  action: string
  target?: string
}

export type ActivityFeedProps = {
  items?: ActivityItem[]
  limit?: number
  title?: string
  description?: string
}

export function ActivityFeed({ items = [], limit = 50, title = "Recent Activity", description = "Last 50 events" }: ActivityFeedProps) {
  const hasItems = (items?.length ?? 0) > 0
  const data = items.slice(0, limit)

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {hasItems ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.user}</TableCell>
                    <TableCell>{item.action}</TableCell>
                    <TableCell>{item.target ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty className="border mt-6">
              <EmptyMedia variant="icon" />
              <EmptyHeader>
                <EmptyTitle>No recent activity</EmptyTitle>
                <EmptyDescription>
                  Activity will appear here once events are recorded.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  )
}