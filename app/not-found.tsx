import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="404 / Not Found" />
        <div className="flex flex-1 flex-col px-4 lg:px-6">
          <Empty className="border mt-6">
            <EmptyMedia variant="icon" />
            <EmptyHeader>
              <EmptyTitle>Page not found</EmptyTitle>
              <EmptyDescription>
                The page you’re looking for doesn’t exist or was moved.
              </EmptyDescription>
            </EmptyHeader>
            <div className="flex gap-2 mt-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </Empty>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}