import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { IntelligenceSettings } from "@/components/intelligence-settings"

export default function IntelligencePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Intelligence Settings" />
        <main className="p-4">
          <IntelligenceSettings />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}