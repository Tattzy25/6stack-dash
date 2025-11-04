'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, FileText, Cpu, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface DashboardGridProps {
  data: {
    totalKeyholders: number
    ideasGenerated: number
    contentItems: number
    activeSessions: number
    totalRequests: number
    tokensUsed: number
    currency: string
  }
}

export function DashboardGrid({ data }: DashboardGridProps) {
  const metrics = [
    {
      title: "Ideas Generated",
      value: data.ideasGenerated,
      icon: FileText,
      color: "text-blue-600",
      bg: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      trend: "+12% from last week"
    },
    {
      title: "Active Keyholders", 
      value: data.totalKeyholders,
      icon: Users,
      color: "text-green-600",
      bg: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      trend: "+3 new this month"
    },
    {
      title: "Tokens Used",
      value: data.tokensUsed.toLocaleString(),
      icon: Cpu,
      color: "text-purple-600",
      bg: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
      trend: `~${Math.round(data.tokensUsed / 1000)}K tokens`
    },
    {
      title: "Content Items",
      value: data.contentItems,
      icon: FileText,
      color: "text-orange-600",
      bg: "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
      trend: "+8% from last week"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Real-time insights into your ask_tattty platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className={`bg-gradient-to-br ${metric.bg}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}