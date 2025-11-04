import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { KpiCards } from "@/components/kpi-cards"
import { ActivityFeed } from "@/components/activity-feed"
import { QuickActions } from "@/components/quick-actions"
import { CommandCenter } from "@/components/command-center"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DashboardGrid } from "@/components/dashboard-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense } from "react"

// Real data integration with the new ask_tattty schema - NO FALLBACKS
async function getDashboardData() {
  try {
    const response = await fetch('http://localhost:4000/api/analytics/overview', {
      next: { revalidate: 10 } // Revalidate every 10 seconds for real-time data
    })
    
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    if (!result.data) {
      throw new Error('No data returned from API')
    }
    
    // Get recent activity from session logs
    const activityResponse = await fetch('http://localhost:4000/api/analytics/activity', {
      next: { revalidate: 10 }
    })
    
    let recentActivity = []
    if (activityResponse.ok) {
      const activityResult = await activityResponse.json()
      recentActivity = activityResult.data || []
    }
    
    return {
      ...result.data,
      recentActivity
    }
    
  } catch (error) {
    console.error('Failed to fetch REAL dashboard data:', error)
    // NO FALLBACKS - throw error to be handled by UI
    throw new Error(`Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function DashboardContent() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Professional Dashboard Header and Metrics */}
      <DashboardGrid data={data} />

      {/* Tabbed Interface */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <KpiCards {...data} />

          {/* Charts and Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>
                  Platform activity over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartAreaInteractive />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions from keyholders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityFeed items={data.recentActivity} />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Detailed performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Comprehensive analytics coming soon with detailed charts,
                  filters, and export capabilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <ActivityFeed items={data.recentActivity} />
        </TabsContent>
      </Tabs>

      {/* Command Center */}
      <CommandCenter />
    </div>
  )
}

export default function Page() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard / Overview" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 py-6 md:gap-8 md:py-8">
              <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }>
                <DashboardContent />
              </Suspense>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
