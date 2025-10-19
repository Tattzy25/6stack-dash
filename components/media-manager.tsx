"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useGlobalControl } from "@/components/global-control-provider"

export type MediaItem = {
  id: string
  title?: string
  user?: string
  date?: string
  category?: string
}

export type MediaManagerProps = {
  items?: MediaItem[]
}

export function MediaManager({ items = [] }: MediaManagerProps) {
  const { logEvent } = useGlobalControl()
  const hasItems = items.length > 0

  function click(name: string) {
    logEvent(`media:${name}`)
  }

  return (
    <div className="px-4 lg:px-6 grid grid-cols-1 gap-4">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter by date, category, and user</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-4">
          <Input placeholder="Date" />
          <Input placeholder="Category" />
          <Input placeholder="User" />
          <div className="col-span-1 sm:col-span-3 flex gap-2">
            <Button variant="outline" onClick={() => click("filter_apply")}>Apply Filters</Button>
            <Button variant="outline" onClick={() => click("filter_clear")}>Clear</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Image Gallery</CardTitle>
          <CardDescription>Approve or delete uploaded images</CardDescription>
        </CardHeader>
        <CardContent>
          {hasItems ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Placeholder: render thumbnails when data is connected */}
              {items.map((m) => (
                <div key={m.id} className="border rounded-md aspect-square" />
              ))}
            </div>
          ) : (
            <Empty className="border mt-6">
              <EmptyMedia variant="icon" />
              <EmptyHeader>
                <EmptyTitle>No media</EmptyTitle>
                <EmptyDescription>Upload images or connect a data source.</EmptyDescription>
              </EmptyHeader>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => click("approve_selected")}>Approve Selected</Button>
                <Button variant="outline" onClick={() => click("delete_selected")}>Delete Selected</Button>
              </div>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Categorization</CardTitle>
          <CardDescription>Styles, moods, placements, and colors</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => click("category_add")}>Add Category</Button>
            <Button variant="outline" onClick={() => click("category_edit")}>Edit Category</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}