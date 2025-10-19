"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { PagesManager } from "@/components/pages-manager"

export default function PagesManagementPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Pages Management" />
        <div className="flex-1 flex flex-col">
          <PagesManager />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}