# Project Schema Documentation

## Overview
This is a comprehensive Next.js 15 dashboard application with AI agent capabilities, built with TypeScript, React 19, and Tailwind CSS. The application features a modular architecture with extensive API endpoints, component-based UI, and advanced functionality including speech-to-text, text-to-speech, code execution, and AI chat capabilities.

## Project Structure

### Root Configuration
- **Framework**: Next.js 15.5.6 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Package Manager**: pnpm 9.0.0
- **UI Library**: Radix UI components with custom styling

### Directory Structure
```
my-app/
├── app/                    # Next.js App Router pages and API routes
├── components/             # Reusable UI components
├── lib/                   # Utility functions and configurations
├── public/                # Static assets
└── Configuration files
```

## Application Architecture

### 1. App Directory Structure (`/app`)

#### Main Routes
- **`/` (Root)**: Redirects to `/dashboard`
- **`/dashboard`**: Main dashboard with KPI cards, activity feed, and quick actions
- **`/activity`**: Activity tracking and monitoring
- **`/analytics`**: Data analytics and reporting
- **`/cms`**: Content Management System
- **`/help`**: Help and documentation
- **`/intelligence`**: AI intelligence features
- **`/marketing`**: Marketing tools and campaigns
- **`/marketplace`**: Marketplace functionality
- **`/office`**: Office agent and productivity tools
- **`/pages`**: Dynamic page management
- **`/reports`**: Reporting and data visualization
- **`/sandbox`**: Code execution sandbox
- **`/search`**: Search functionality
- **`/settings`**: Application settings
- **`/users`**: User management

#### API Endpoints (`/app/api`)

##### Core AI Services
- **`/api/chat`**: Chat completions with Groq/OpenAI support
- **`/api/stt`**: Speech-to-Text using OpenAI Whisper
- **`/api/tts`**: Text-to-Speech with OpenAI/ElevenLabs
- **`/api/e2b`**: Code execution sandbox using E2B

##### Agent & Tools
- **`/api/agent/plan`**: AI agent planning with goal-based step generation
- **`/api/tools/execute`**: Tool execution with policy checks and approvals
- **`/api/bridge`**: Message bridging with external agents

##### Administrative
- **`/api/approvals`**: Approval management system
- **`/api/approvals/[id]`**: Individual approval handling

### 2. Components Architecture (`/components`)

#### Core Components
- **`app-sidebar.tsx`**: Main navigation with feature flag filtering
- **`office-agent.tsx`**: AI agent interface with chat, STT, tools
- **`global-control-provider.tsx`**: Application-wide state management
- **`theme-provider.tsx`**: Dark/light theme management
- **`maintenance-banner.tsx`**: Maintenance mode indicator

#### Feature Components
- **`activity-feed.tsx`**: Real-time activity monitoring
- **`analytics-overview.tsx`**: Analytics dashboard
- **`cms-manager.tsx`**: Content management interface
- **`command-center.tsx`**: Command palette and shortcuts
- **`data-table.tsx`**: Advanced data table with sorting/filtering

#### UI Components (`/components/ui`)
- Radix UI-based components: Avatar, Button, Card, Dialog, Input, Select, Table, etc.
- Custom styled with Tailwind CSS and class-variance-authority

### 3. Library & Utilities (`/lib`)

#### Configuration Files
- **`allowed-tools.ts`**: Tool policy management with role-based access
- **`pages-config.ts`**: Dynamic page configuration system
- **`utils.ts`**: Utility functions (likely cn() for class merging)

#### Tool Policies
```typescript
type ToolPolicy = {
  id: string
  description: string
  rolesAllowed: string[]
  approvalRequired: boolean
  rateLimit: { limit: number; windowSec: number }
  execution: "vercel" | "sandbox" | "local"
}
```

## Data Models & Types

### Global State Management
```typescript
type GlobalControlContext = {
  maintenanceMode: boolean
  readOnlyMode: boolean
  featureFlags: {
    analytics: boolean
    marketplace: boolean
    marketing: boolean
    cms: boolean
    reports: boolean
    users: boolean
    content: boolean
    activity: boolean
    settings: boolean
  }
  impersonationUser: string | null
  events: Event[]
}
```

### Page Management
```typescript
type PageEntry = {
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

type PageSection = {
  id: string
  type: "text" | "gallery" | "embed"
  title?: string
  content?: string
  images?: string[]
  embedHtml?: string
}
```

## API Schema

### Chat API (`/api/chat`)
- **Method**: POST
- **Providers**: Groq, OpenAI
- **Input**: Messages array with role/content
- **Output**: Streaming chat completion
- **Features**: Message normalization, provider switching

### Speech Services
#### STT (`/api/stt`)
- **Method**: POST
- **Input**: Base64 encoded audio buffer
- **Output**: Transcribed text
- **Provider**: OpenAI Whisper

#### TTS (`/api/tts`)
- **Method**: POST
- **Input**: Text, voice, provider
- **Output**: Base64 encoded audio
- **Providers**: OpenAI, ElevenLabs

### Code Execution (`/api/e2b`)
- **Method**: POST
- **Input**: Code string
- **Output**: Execution logs and files
- **Environment**: Sandboxed code interpreter

### Agent Planning (`/api/agent/plan`)
- **Method**: POST
- **Input**: Goal and context
- **Output**: Step-by-step plan
- **Features**: Keyword-based plan generation

### Tool Execution (`/api/tools/execute`)
- **Method**: POST
- **Input**: Tool ID, parameters, user role
- **Output**: Execution result
- **Features**: Policy validation, rate limiting, approval workflow

## Dependencies & Technology Stack

### Core Dependencies
- **Next.js**: 15.5.6 (React framework)
- **React**: 19.2.0 (UI library)
- **TypeScript**: 5 (Type safety)
- **Tailwind CSS**: 4 (Styling)

### UI & Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Tabler Icons**: Additional icons
- **shadcn/ui**: Component system
- **Sonner**: Toast notifications
- **Vaul**: Drawer component

### AI & External Services
- **OpenAI**: 6.5.0 (AI services)
- **Groq SDK**: 0.33.0 (Alternative AI provider)
- **E2B Code Interpreter**: 2.1.0 (Code execution)

### Data & State Management
- **TanStack Table**: 8.21.3 (Advanced tables)
- **DND Kit**: Drag and drop functionality
- **Recharts**: 2.15.4 (Data visualization)
- **Zod**: 4.1.12 (Schema validation)

### Database & Storage
- **Neon Database**: Serverless PostgreSQL

## Feature Flags & Access Control

### Available Features
- Analytics dashboard
- Marketplace functionality
- Marketing tools
- Content Management System
- Reports and data visualization
- User management
- Content creation
- Activity monitoring
- Settings management

### Role-Based Access
- **Owner**: Full access to all tools
- **Assistant**: Limited tool access
- **Marketing**: CMS and marketing tools
- **Content**: Content-related tools

### Tool Execution Environments
- **Local**: File system operations
- **Sandbox**: Code execution and edits
- **Vercel**: API-based operations

## Development & Deployment

### Scripts
- `pnpm dev`: Development server (port 3000)
- `pnpm build`: Production build
- `pnpm start`: Production server
- `pnpm lint`: ESLint checking

### Configuration
- **ESLint**: Configured with Next.js rules
- **TypeScript**: Strict mode enabled
- **Build**: Optimized for production with file tracing

### Environment
- Development server: `http://localhost:3001`
- Production server: `http://localhost:3002`
- Build output: Optimized static and server-side rendered pages

## Security & Policies

### Rate Limiting
- Tool-specific rate limits (e.g., 30 requests/60s for file reads)
- User role-based restrictions
- Approval workflows for sensitive operations

### Data Protection
- Local storage for state persistence
- Secure API key handling
- Sandboxed code execution environment

This schema represents a comprehensive, production-ready dashboard application with advanced AI capabilities, robust security measures, and extensive customization options.