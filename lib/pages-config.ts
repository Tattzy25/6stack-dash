export type SectionType = "text" | "gallery" | "embed"

export type PageSection = {
  id: string
  type: SectionType
  title?: string
  content?: string
  images?: string[]
  embedHtml?: string
}

export type PageEntry = {
  id: string
  title: string
  slug: string
  status: "draft" | "published"
  theme?: {
    primary?: string
    secondary?: string
    accent?: string
  }
  sections: PageSection[]
}

export type PagesConfig = {
  pages: PageEntry[]
}

export const defaultPagesConfig: PagesConfig = {
  pages: [
    {
      id: "image-gen",
      title: "Image Generator",
      slug: "/image-gen",
      status: "draft",
      theme: {
        primary: "#4f46e5",
        secondary: "#0ea5e9",
        accent: "#f59e0b",
      },
      sections: [
        {
          id: "hero",
          type: "text",
          title: "Create Stunning AI Images",
          content: "Use prompts, styles, and moods to generate images instantly.",
        },
        {
          id: "examples",
          type: "gallery",
          title: "Featured Gallery",
          images: [
            "/next.svg",
            "/vercel.svg",
            "/globe.svg",
          ],
        },
        {
          id: "tutorial",
          type: "embed",
          title: "Quick Tutorial",
          embedHtml: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/dQw4w9WgXcQ\" title=\"YouTube video player\" frameborder=\"0\" allowfullscreen></iframe>",
        },
      ],
    },
  ],
}

export function loadPagesConfig(): PagesConfig {
  try {
    const raw = localStorage.getItem("pages-config")
    if (raw) return JSON.parse(raw)
  } catch (e) {
    // ignore
  }
  return defaultPagesConfig
}

export function savePagesConfig(cfg: PagesConfig) {
  try {
    localStorage.setItem("pages-config", JSON.stringify(cfg))
  } catch (e) {
    // ignore
  }
}