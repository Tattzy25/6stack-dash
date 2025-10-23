"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { BatchesManager } from "@/components/batches-manager"

export default function BatchesPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Batches" />
        <div className="flex-1 flex flex-col">
          <BatchesManager />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
