import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { OfficeAgent } from "@/components/office-agent"

export default function OfficePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Office" />
        <main className="p-4 lg:p-6">
          <OfficeAgent />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}