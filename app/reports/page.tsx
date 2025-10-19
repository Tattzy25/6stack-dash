"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { ReportsManager } from "@/components/reports-manager"

export default function ReportsPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Reports & Export" />
        <div className="flex-1 flex flex-col">
          <ReportsManager />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}