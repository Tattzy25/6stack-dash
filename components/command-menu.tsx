"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IconSearch } from "@tabler/icons-react"
import { useGlobalControl } from "@/components/global-control-provider"

const NAV_ITEMS = [
  { title: "Dashboard / Overview", href: "/dashboard" },
  { title: "User Management", href: "/users" },
  { title: "Content & Media Management", href: "/content" },
  { title: "Session & Activity Logs", href: "/activity" },
  { title: "Analytics & Data Insights", href: "/analytics" },
  { title: "Marketing & Engagement", href: "/marketing" },
  { title: "System Settings / Configurations", href: "/settings" },
  { title: "Reports & Export", href: "/reports" },
]

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const { logEvent } = useGlobalControl()

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return NAV_ITEMS
    return NAV_ITEMS.filter((i) => i.title.toLowerCase().includes(query))
  }, [q])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <IconSearch className="size-4" />
          Search
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="p-0">
        <SheetHeader className="p-4">
          <SheetTitle>Search Navigation</SheetTitle>
        </SheetHeader>
        <div className="p-4 border-t">
          <Input
            autoFocus
            placeholder="Type to search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-2 mt-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <Button
                key={r.href}
                asChild
                variant="outline"
                onClick={() => {
                  logEvent("nav:search", r.href)
                  setOpen(false)
                  setQ("")
                }}
              >
                <Link href={r.href}>{r.title}</Link>
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}