"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyIcon, EmptyTitle } from "@/components/ui/empty"
import { useGlobalControl } from "@/components/global-control-provider"

export type LandingPage = { id: string; title?: string }
export type CarouselImage = { id: string; url?: string }
export type StaticContent = { id: string; key?: string; value?: string }
export type BlogPost = { id: string; title?: string }

export type CMSManagerProps = {
  landing?: LandingPage[]
  carousel?: CarouselImage[]
  staticContent?: StaticContent[]
  blog?: BlogPost[]
}

export function CMSManager({ landing = [], carousel = [], staticContent = [], blog = [] }: CMSManagerProps) {
  const { logEvent } = useGlobalControl()

  function click(name: string) {
    logEvent(`cms:${name}`)
  }

  return (
    <div className="px-4 lg:px-6 grid grid-cols-1 gap-4">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Landing Pages</CardTitle>
          <CardDescription>Create and manage landing pages</CardDescription>
        </CardHeader>
        <CardContent>
          {landing.length ? (
            <div className="space-y-2">
              {landing.map((l) => (
                <div key={l.id} className="border rounded-md p-3 flex items-center justify-between">
                  <div className="font-medium">{l.title ?? "Untitled"}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => click(`landing_edit:${l.id}`)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => click(`landing_publish:${l.id}`)}>Publish</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border mt-6">
              <EmptyIcon />
              <EmptyHeader>
                <EmptyTitle>No landing pages</EmptyTitle>
                <EmptyDescription>Create a landing page to get started.</EmptyDescription>
              </EmptyHeader>
              <div className="mt-4">
                <Button variant="outline" onClick={() => click("landing_create")}>Create Landing Page</Button>
              </div>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Carousel Images</CardTitle>
          <CardDescription>Manage homepage carousel</CardDescription>
        </CardHeader>
        <CardContent>
          {carousel.length ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {carousel.map((c) => (
                <div key={c.id} className="border rounded-md aspect-square" />
              ))}
            </div>
          ) : (
            <Empty className="border mt-6">
              <EmptyIcon />
              <EmptyHeader>
                <EmptyTitle>No carousel images</EmptyTitle>
                <EmptyDescription>Add images to the homepage carousel.</EmptyDescription>
              </EmptyHeader>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => click("carousel_add")}>Add Image</Button>
                <Button variant="outline" onClick={() => click("carousel_reorder")}>Reorder</Button>
              </div>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Static Content</CardTitle>
          <CardDescription>Headers, footers, and legal pages</CardDescription>
        </CardHeader>
        <CardContent>
          {staticContent.length ? (
            <div className="space-y-2">
              {staticContent.map((s) => (
                <div key={s.id} className="border rounded-md p-3 flex items-center justify-between">
                  <div className="font-medium">{s.key ?? "key"}</div>
                  <div className="text-sm text-muted-foreground">{s.value ?? ""}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => click(`static_edit:${s.id}`)}>Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border mt-6">
              <EmptyIcon />
              <EmptyHeader>
                <EmptyTitle>No static content</EmptyTitle>
                <EmptyDescription>Manage site copy and legal pages.</EmptyDescription>
              </EmptyHeader>
              <div className="mt-4">
                <Button variant="outline" onClick={() => click("static_add")}>Add Content</Button>
              </div>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Blog / News</CardTitle>
          <CardDescription>Post updates and articles</CardDescription>
        </CardHeader>
        <CardContent>
          {blog.length ? (
            <div className="space-y-2">
              {blog.map((b) => (
                <div key={b.id} className="border rounded-md p-3 flex items-center justify-between">
                  <div className="font-medium">{b.title ?? "Untitled"}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => click(`blog_edit:${b.id}`)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => click(`blog_publish:${b.id}`)}>Publish</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border mt-6">
              <EmptyIcon />
              <EmptyHeader>
                <EmptyTitle>No blog posts</EmptyTitle>
                <EmptyDescription>Write posts to inform users.</EmptyDescription>
              </EmptyHeader>
              <div className="mt-4">
                <Button variant="outline" onClick={() => click("blog_create")}>Create Post</Button>
              </div>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  )
}