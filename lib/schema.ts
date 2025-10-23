import { pgTable, uuid, text, boolean, timestamp, varchar, integer, decimal, jsonb, serial, index, uniqueIndex } from 'drizzle-orm/pg-core';

// =====================================================
// CORE SYSTEM TABLES
// =====================================================

export const systemConfig = pgTable('system_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  maintenanceMode: boolean('maintenance_mode').default(false),
  readOnlyMode: boolean('read_only_mode').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const featureFlags = pgTable('feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  flagName: varchar('flag_name', { length: 50 }).notNull(),
  enabled: boolean('enabled').default(false),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =====================================================
// USER MANAGEMENT
// =====================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  active: boolean('active').default(true),
  lastActive: timestamp('last_active'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  roleIdx: index('idx_users_role').on(table.role),
  activeIdx: index('idx_users_active').on(table.active),
}));

export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  startedAt: timestamp('started_at').defaultNow(),
  lastActivity: timestamp('last_activity').defaultNow(),
  status: varchar('status', { length: 20 }).default('active'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
}, (table) => ({
  userIdx: index('idx_user_sessions_user_id').on(table.userId),
  statusIdx: index('idx_user_sessions_status').on(table.status),
}));

// =====================================================
// CONTENT MANAGEMENT SYSTEM
// =====================================================

export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 20 }).default('draft'),
  themePrimary: varchar('theme_primary', { length: 7 }),
  themeSecondary: varchar('theme_secondary', { length: 7 }),
  themeAccent: varchar('theme_accent', { length: 7 }),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  slugIdx: index('idx_pages_slug').on(table.slug),
  statusIdx: index('idx_pages_status').on(table.status),
}));

export const pageSections = pgTable('page_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id').references(() => pages.id, { onDelete: 'cascade' }),
  sectionType: varchar('section_type', { length: 20 }).notNull(),
  title: varchar('title', { length: 255 }),
  content: text('content'),
  embedHtml: text('embed_html'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  pageIdx: index('idx_page_sections_page_id').on(table.pageId),
  typeIdx: index('idx_page_sections_type').on(table.sectionType),
}));

// =====================================================
// ACTIVITY TRACKING & LOGGING
// =====================================================

export const activityEvents = pgTable('activity_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: uuid('session_id').references(() => userSessions.id),
  message: text('message'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('idx_activity_events_user_id').on(table.userId),
  typeIdx: index('idx_activity_events_type').on(table.eventType),
  createdIdx: index('idx_activity_events_created_at').on(table.createdAt),
}));

export const activityFeed = pgTable('activity_feed', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  userId: uuid('user_id').references(() => users.id),
  actionType: varchar('action_type', { length: 50 }),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  timestamp: timestamp('timestamp').defaultNow(),
  metadata: jsonb('metadata'),
}, (table) => ({
  userIdx: index('idx_activity_feed_user_id').on(table.userId),
  timestampIdx: index('idx_activity_feed_timestamp').on(table.timestamp),
}));

// =====================================================
// TOOL EXECUTION & APPROVALS
// =====================================================

export const toolPolicies = pgTable('tool_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  toolId: varchar('tool_id', { length: 100 }).notNull().unique(),
  description: text('description').notNull(),
  rolesAllowed: text('roles_allowed').array().notNull(),
  approvalRequired: boolean('approval_required').default(false),
  rateLimitCount: integer('rate_limit_count').default(10),
  rateLimitWindowSec: integer('rate_limit_window_sec').default(60),
  executionEnvironment: varchar('execution_environment', { length: 20 }).default('local'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const toolExecutions = pgTable('tool_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  toolId: varchar('tool_id', { length: 100 }).notNull(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: uuid('session_id').references(() => userSessions.id),
  parameters: jsonb('parameters'),
  result: jsonb('result'),
  status: varchar('status', { length: 20 }).default('pending'),
  executionTimeMs: integer('execution_time_ms'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userIdx: index('idx_tool_executions_user_id').on(table.userId),
  toolIdx: index('idx_tool_executions_tool_id').on(table.toolId),
  statusIdx: index('idx_tool_executions_status').on(table.status),
}));

// =====================================================
// MARKETPLACE & TRANSACTIONS
// =====================================================

export const tokenPacks = pgTable('token_packs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  tokens: integer('tokens').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userTokens = pgTable('user_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique(),
  balance: integer('balance').default(0),
  totalPurchased: integer('total_purchased').default(0),
  totalUsed: integer('total_used').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =====================================================
// AI SERVICES & CHAT
// =====================================================

export const chatConversations = pgTable('chat_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: uuid('session_id').references(() => userSessions.id),
  title: varchar('title', { length: 255 }),
  provider: varchar('provider', { length: 20 }).default('openai'),
  model: varchar('model', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('idx_chat_conversations_user_id').on(table.userId),
}));

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => chatConversations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  tokensUsed: integer('tokens_used'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  conversationIdx: index('idx_chat_messages_conversation_id').on(table.conversationId),
}));

export const codeExecutions = pgTable('code_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: uuid('session_id').references(() => userSessions.id),
  code: text('code').notNull(),
  language: varchar('language', { length: 50 }).default('python'),
  executionLogs: text('execution_logs'),
  outputFiles: jsonb('output_files'),
  executionTimeMs: integer('execution_time_ms'),
  status: varchar('status', { length: 20 }).default('pending'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userIdx: index('idx_code_executions_user_id').on(table.userId),
}));

// =====================================================
// ANALYTICS & REPORTING
// =====================================================

export const kpiMetrics = pgTable('kpi_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  metricName: varchar('metric_name', { length: 100 }).notNull(),
  metricValue: decimal('metric_value', { precision: 15, scale: 4 }).notNull(),
  metricType: varchar('metric_type', { length: 50 }),
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  metricUnique: uniqueIndex('metric_name_period_unique').on(table.metricName, table.periodStart, table.periodEnd),
  nameIdx: index('idx_kpi_metrics_name').on(table.metricName),
  periodIdx: index('idx_kpi_metrics_period').on(table.periodStart, table.periodEnd),
}));

// =====================================================
// PLATINUM TABLE
// =====================================================

export const platinum = pgTable('platinum', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  value: decimal('value', { precision: 15, scale: 2 }).notNull().default('0.00'),
  weight: decimal('weight', { precision: 10, scale: 4 }),
  purity: varchar('purity', { length: 50 }),
  status: varchar('status', { length: 50 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  metadata: jsonb('metadata'),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  location: varchar('location', { length: 255 }),
  certificationNumber: varchar('certification_number', { length: 100 }),
  certificationDate: timestamp('certification_date'),
  images: text('images').array(),
  tags: text('tags').array(),
}, (table) => ({
  ownerIdx: index('idx_platinum_owner_id').on(table.ownerId),
  statusIdx: index('idx_platinum_status').on(table.status),
  valueIdx: index('idx_platinum_value').on(table.value),
  createdIdx: index('idx_platinum_created_at').on(table.createdAt),
  tagsIdx: index('idx_platinum_tags').on(table.tags),
}));

// =====================================================
// LLM TABLE
// =====================================================

export const llm = pgTable('llm', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  modelName: varchar('model_name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 100 }).notNull(),
  version: varchar('version', { length: 50 }),
  apiEndpoint: varchar('api_endpoint', { length: 500 }),
  apiKeyRequired: boolean('api_key_required').default(true),
  maxTokens: integer('max_tokens').default(4096),
  temperature: decimal('temperature', { precision: 3, scale: 2 }).default('0.7'),
  contextWindow: integer('context_window').default(4096),
  costPerToken: decimal('cost_per_token', { precision: 10, scale: 8 }),
  rateLimitPerMinute: integer('rate_limit_per_minute').default(60),
  isActive: boolean('is_active').default(true),
  capabilities: jsonb('capabilities'),
  supportedLanguages: text('supported_languages').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  description: text('description'),
  metadata: jsonb('metadata'),
}, (table) => ({
  providerIdx: index('idx_llm_provider').on(table.provider),
  activeIdx: index('idx_llm_is_active').on(table.isActive),
  createdIdx: index('idx_llm_created_at').on(table.createdAt),
  capabilitiesIdx: index('idx_llm_capabilities').on(table.capabilities),
}));
