"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MarketingManager } from "@/components/marketing-manager"

export default function MarketingPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Marketing & Engagement" />
        <div className="flex-1 flex flex-col">
          <MarketingManager />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}