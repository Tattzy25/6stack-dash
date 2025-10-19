"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { KpiCards } from "@/components/kpi-cards"
import { ActivityFeed } from "@/components/activity-feed"
import { QuickActions } from "@/components/quick-actions"
import { CommandCenter } from "@/components/command-center"
import { useGlobalControl } from "@/components/global-control-provider"

export default function Page() {
  const { events } = useGlobalControl()

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
              <CommandCenter />
              <KpiCards />
              <ActivityFeed items={events} />
              <QuickActions />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
