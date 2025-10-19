"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MarketplaceManager } from "@/components/marketplace-manager"

export default function MarketplacePage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Marketplace / Payments & Tokens" />
        <div className="flex-1 flex flex-col">
          <MarketplaceManager />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}