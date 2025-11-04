import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { KpiCards } from "@/components/kpi-cards"
import { ActivityFeed } from "@/components/activity-feed"
import { QuickActions } from "@/components/quick-actions"
import { CommandCenter } from "@/components/command-center"
import { Suspense } from "react"

// Mock data since database has been erased
const mockKpiData = {
  totalUsers: 0,
  activeSessions: 0,
  imagesGenerated: 0,
  sales: 0,
  tokensLeft: 0,
  currency: 'USD',
}

const mockActivityData = []

async function DashboardContent() {
  // Use mock data since database has been erased
  return (
    <>
      <CommandCenter />
      <KpiCards {...mockKpiData} />
      <ActivityFeed items={mockActivityData} />
      <QuickActions />
    </>
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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Suspense fallback={<div>Loading...</div>}>
                <DashboardContent />
              </Suspense>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
