"use client"

import React, { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { OfficeAgent } from "@/components/office-agent"
import { IconRobot } from "@tabler/icons-react"

export function OfficeWidget() {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <IconRobot className="size-4" /> Office
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh] p-0">
        <SheetHeader className="px-4 py-3">
          <SheetTitle>Office (Quick Access)</SheetTitle>
        </SheetHeader>
        <div className="p-4 overflow-auto">
          <OfficeAgent />
        </div>
      </SheetContent>
    </Sheet>
  )
}