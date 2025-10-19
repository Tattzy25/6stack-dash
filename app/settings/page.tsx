"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SettingsManager } from "@/components/settings-manager"

export default function SettingsPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="System Settings / Configurations" />
        <div className="flex-1 flex flex-col">
          <SettingsManager />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}