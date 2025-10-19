"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { UsersManager } from "@/components/users-manager"

export default function UsersPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="User Management" />
        <div className="flex-1 flex flex-col">
          <UsersManager />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}