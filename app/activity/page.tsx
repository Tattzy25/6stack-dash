"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { ActivityManager } from "@/components/activity-manager"

export default function ActivityPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Session & Activity Logs" />
        <div className="flex-1 flex flex-col">
          <ActivityManager />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}