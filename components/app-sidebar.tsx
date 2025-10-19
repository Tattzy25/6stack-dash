"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconRobot,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useGlobalControl } from "@/components/global-control-provider"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard / Overview", url: "/dashboard", icon: IconDashboard },
    { title: "User Management", url: "/users", icon: IconUsers },
    { title: "Content & Media Management", url: "/content", icon: IconFolder },
    { title: "Session & Activity Logs", url: "/activity", icon: IconListDetails },
    { title: "Analytics & Data Insights", url: "/analytics", icon: IconChartBar },
    { title: "Office", url: "/office", icon: IconRobot },
    { title: "Marketplace / Payments & Tokens", url: "/marketplace", icon: IconDatabase },
    { title: "Marketing & Engagement", url: "/marketing", icon: IconCamera },
    { title: "Pages Management", url: "/pages", icon: IconFileAi },
    { title: "Content Customization / CMS", url: "/cms", icon: IconFileDescription },
    { title: "System Settings / Configurations", url: "/settings", icon: IconSettings },
    { title: "Reports & Export", url: "/reports", icon: IconReport },
  ],
  navSecondary: [
    { title: "Get Help", url: "/help", icon: IconHelp },
    { title: "Search", url: "/search", icon: IconSearch },
  ],
  documents: [
    { name: "Data Library", url: "#", icon: IconDatabase },
    { name: "Word Assistant", url: "#", icon: IconFileWord },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { featureFlags } = useGlobalControl()

  const items = React.useMemo(() => {
    return data.navMain.filter((item) => {
      const key = item.url.replace(/^\//, "") as keyof typeof featureFlags
      if (key === "dashboard") return true
      return featureFlags[key] !== false
    })
  }, [featureFlags])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
