import Link from "next/link"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export default function HelpPage() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Help" />
        <div className="flex flex-1 flex-col px-4 lg:px-6">
          <Empty className="border mt-6">
            <EmptyMedia variant="icon" />
            <EmptyHeader>
              <EmptyTitle>Need help?</EmptyTitle>
              <EmptyDescription>
                Use the Command Menu to find pages, or visit Settings to configure providers.
              </EmptyDescription>
            </EmptyHeader>
            <div className="flex gap-2 mt-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/intelligence">Intelligence Settings</Link>
              </Button>
            </div>
          </Empty>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}