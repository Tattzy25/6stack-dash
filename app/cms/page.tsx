"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { CMSManager } from "@/components/cms-manager"

export default function CMSPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Content Customization / CMS" />
        <div className="flex-1 flex flex-col">
          <CMSManager />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}