"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { AnalyticsOverview } from "@/components/analytics-overview"

export default function AnalyticsPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Analytics & Data Insights" />
        <div className="flex-1 flex flex-col">
          <AnalyticsOverview />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}