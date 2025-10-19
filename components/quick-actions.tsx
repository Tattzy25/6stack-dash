import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type Icon, IconCamera, IconDatabase, IconFolder, IconReport, IconUsers } from "@tabler/icons-react"

export type QuickAction = {
  label: string
  href: string
  icon?: Icon
}

export type QuickActionsProps = {
  actions?: QuickAction[]
  title?: string
}

export function QuickActions({ actions, title = "Quick Actions" }: QuickActionsProps) {
  const defaults: QuickAction[] = [
    { href: "/users", label: "Create User", icon: IconUsers },
    { href: "/content", label: "Upload Media", icon: IconFolder },
    { href: "/marketing", label: "Start Campaign", icon: IconCamera },
    { href: "/marketplace", label: "Buy Tokens", icon: IconDatabase },
    { href: "/reports", label: "View Reports", icon: IconReport },
  ]
  const list = actions ?? defaults

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((action, idx) => (
              <Button asChild variant="outline" key={idx}>
                <Link href={action.href}>
                  {action.icon ? <action.icon /> : null}
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}