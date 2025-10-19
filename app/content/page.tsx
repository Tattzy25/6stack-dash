"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MediaManager } from "@/components/media-manager"

export default function ContentPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Content & Media Management" />
        <div className="flex-1 flex flex-col">
          <MediaManager />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}