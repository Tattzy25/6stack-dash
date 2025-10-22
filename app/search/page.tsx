import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CommandMenu } from "@/components/command-menu"

export default function SearchPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Search" />
        <main className="p-4 grid grid-cols-1 gap-4">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Search Navigation</CardTitle>
              <CardDescription>Use the command menu to quickly jump around.</CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <CommandMenu />
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}