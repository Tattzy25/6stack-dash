-- =====================================================
-- TATTTY DASHBOARD - DATABASE SCHEMA
-- =====================================================
-- Generated from PROJECT_SCHEMA.md analysis
-- Compatible with PostgreSQL (Neon Database)
-- =====================================================

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE SYSTEM TABLES
-- =====================================================

-- System configuration and feature flags
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    maintenance_mode BOOLEAN DEFAULT FALSE,
    read_only_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags management
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_name VARCHAR(50) NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default feature flags
INSERT INTO feature_flags (flag_name, enabled, description) VALUES
('analytics', true, 'Analytics dashboard functionality'),
('marketplace', true, 'Marketplace and payment features'),
('marketing', true, 'Marketing tools and campaigns'),
('cms', true, 'Content Management System'),
('reports', true, 'Reports and data visualization'),
('users', true, 'User management features'),
('content', true, 'Content creation and management'),
('activity', true, 'Activity monitoring and logging'),
('settings', true, 'System settings management');

-- =====================================================
-- USER MANAGEMENT
-- =====================================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    active BOOLEAN DEFAULT TRUE,
    last_active TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'assistant', 'marketing', 'content', 'user'))
);

-- User sessions for tracking active sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    ip_address INET,
    user_agent TEXT,
    
    CONSTRAINT valid_session_status CHECK (status IN ('active', 'expired', 'terminated'))
);

-- =====================================================
-- CONTENT MANAGEMENT SYSTEM
-- =====================================================

-- Pages for dynamic page management
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'draft',
    theme_primary VARCHAR(7), -- Hex color
    theme_secondary VARCHAR(7), -- Hex color
    theme_accent VARCHAR(7), -- Hex color
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_page_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- Page sections for modular content
CREATE TABLE page_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    section_type VARCHAR(20) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    embed_html TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_section_type CHECK (section_type IN ('text', 'gallery', 'embed'))
);

-- Images for gallery sections
CREATE TABLE section_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES page_sections(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ACTIVITY TRACKING & LOGGING
-- =====================================================

-- Activity events for comprehensive logging
CREATE TABLE activity_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES user_sessions(id),
    message TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity feed items for dashboard display
CREATE TABLE activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- =====================================================
-- TOOL EXECUTION & APPROVALS
-- =====================================================

-- Tool policies for access control
CREATE TABLE tool_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    roles_allowed TEXT[] NOT NULL,
    approval_required BOOLEAN DEFAULT FALSE,
    rate_limit_count INTEGER DEFAULT 10,
    rate_limit_window_sec INTEGER DEFAULT 60,
    execution_environment VARCHAR(20) DEFAULT 'local',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_execution_env CHECK (execution_environment IN ('vercel', 'sandbox', 'local'))
);

-- Insert default tool policies
INSERT INTO tool_policies (tool_id, description, roles_allowed, approval_required, rate_limit_count, rate_limit_window_sec, execution_environment) VALUES
('fs.read', 'Read files from the repo within allowed paths', ARRAY['owner', 'assistant', 'content'], false, 30, 60, 'local'),
('code.proposeEdit', 'Propose code edits with diffs and apply after approval', ARRAY['owner', 'assistant'], true, 10, 60, 'sandbox'),
('cms.createPost', 'Create a post via CMS API', ARRAY['marketing', 'owner'], true, 5, 60, 'vercel'),
('bridge.message', 'Send a message to the website agent', ARRAY['owner', 'assistant'], false, 20, 60, 'vercel');

-- Tool executions for tracking usage
CREATE TABLE tool_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES user_sessions(id),
    parameters JSONB,
    result JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    execution_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_execution_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled'))
);

-- Approvals for sensitive operations
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id),
    approver_id UUID REFERENCES users(id),
    parameters JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_approval_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Rate limiting tracking
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id),
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tool_id, user_id, window_start)
);

-- =====================================================
-- MARKETPLACE & TRANSACTIONS
-- =====================================================

-- Token packs for marketplace
CREATE TABLE token_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tokens INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions for payment tracking
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50),
    external_transaction_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_transaction_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled'))
);

-- User token balances
CREATE TABLE user_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) UNIQUE,
    balance INTEGER DEFAULT 0,
    total_purchased INTEGER DEFAULT 0,
    total_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AI SERVICES & CHAT
-- =====================================================

-- Chat conversations
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES user_sessions(id),
    title VARCHAR(255),
    provider VARCHAR(20) DEFAULT 'openai',
    model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_chat_provider CHECK (provider IN ('openai', 'groq'))
);

-- Chat messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_message_role CHECK (role IN ('user', 'assistant', 'system'))
);

-- Speech-to-text requests
CREATE TABLE stt_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES user_sessions(id),
    audio_duration_sec DECIMAL(8,2),
    transcribed_text TEXT,
    provider VARCHAR(20) DEFAULT 'openai',
    model VARCHAR(50) DEFAULT 'whisper-1',
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Text-to-speech requests
CREATE TABLE tts_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES user_sessions(id),
    input_text TEXT NOT NULL,
    voice VARCHAR(50),
    provider VARCHAR(20) DEFAULT 'openai',
    model VARCHAR(50),
    audio_length_sec DECIMAL(8,2),
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_tts_provider CHECK (provider IN ('openai', 'elevenlabs'))
);

-- Code execution sandbox requests
CREATE TABLE code_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES user_sessions(id),
    code TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'python',
    execution_logs TEXT,
    output_files JSONB,
    execution_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_code_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'timeout'))
);

-- =====================================================
-- ANALYTICS & REPORTING
-- =====================================================

-- Analytics events for tracking user behavior
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES user_sessions(id),
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    event_value DECIMAL(10,2),
    properties JSONB,
    page_url TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI metrics for dashboard
CREATE TABLE kpi_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_type VARCHAR(50),
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(metric_name, period_start, period_end)
);

-- =====================================================
-- TASKS & WORKFLOW
-- =====================================================

-- Tasks for workflow management
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(10) DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_task_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT valid_task_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User management indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_status ON user_sessions(status);

-- Content management indexes
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX idx_page_sections_type ON page_sections(section_type);

-- Activity tracking indexes
CREATE INDEX idx_activity_events_user_id ON activity_events(user_id);
CREATE INDEX idx_activity_events_type ON activity_events(event_type);
CREATE INDEX idx_activity_events_created_at ON activity_events(created_at);
CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_timestamp ON activity_feed(timestamp);

-- Tool execution indexes
CREATE INDEX idx_tool_executions_user_id ON tool_executions(user_id);
CREATE INDEX idx_tool_executions_tool_id ON tool_executions(tool_id);
CREATE INDEX idx_tool_executions_status ON tool_executions(status);
CREATE INDEX idx_approvals_user_id ON approvals(user_id);
CREATE INDEX idx_approvals_status ON approvals(status);

-- Chat and AI services indexes
CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_stt_requests_user_id ON stt_requests(user_id);
CREATE INDEX idx_tts_requests_user_id ON tts_requests(user_id);
CREATE INDEX idx_code_executions_user_id ON code_executions(user_id);

-- Analytics indexes
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_kpi_metrics_name ON kpi_metrics(metric_name);
CREATE INDEX idx_kpi_metrics_period ON kpi_metrics(period_start, period_end);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_sections_updated_at BEFORE UPDATE ON page_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tool_policies_updated_at BEFORE UPDATE ON tool_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_tokens_updated_at BEFORE UPDATE ON user_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON chat_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_token_packs_updated_at BEFORE UPDATE ON token_packs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default system configuration
INSERT INTO system_config (maintenance_mode, read_only_mode) VALUES (false, false);

-- Insert default admin user (update with real data)
INSERT INTO users (name, email, role, active) VALUES 
('System Admin', 'admin@tattty.com', 'owner', true);

-- Insert sample token packs
INSERT INTO token_packs (name, tokens, price, currency) VALUES
('Starter Pack', 1000, 9.99, 'USD'),
('Pro Pack', 5000, 39.99, 'USD'),
('Enterprise Pack', 20000, 149.99, 'USD');

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active users with session info
CREATE VIEW active_users AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.last_active,
    COUNT(s.id) as active_sessions
FROM users u
LEFT JOIN user_sessions s ON u.id = s.user_id AND s.status = 'active'
WHERE u.active = true
GROUP BY u.id, u.name, u.email, u.role, u.last_active;

-- Recent activity summary
CREATE VIEW recent_activity AS
SELECT 
    ae.id,
    ae.event_type,
    ae.message,
    u.name as user_name,
    u.email as user_email,
    ae.created_at
FROM activity_events ae
LEFT JOIN users u ON ae.user_id = u.id
ORDER BY ae.created_at DESC
LIMIT 100;

-- Tool usage statistics
CREATE VIEW tool_usage_stats AS
SELECT 
    te.tool_id,
    tp.description,
    COUNT(*) as total_executions,
    COUNT(CASE WHEN te.status = 'completed' THEN 1 END) as successful_executions,
    COUNT(CASE WHEN te.status = 'failed' THEN 1 END) as failed_executions,
    AVG(te.execution_time_ms) as avg_execution_time_ms
FROM tool_executions te
JOIN tool_policies tp ON te.tool_id = tp.tool_id
GROUP BY te.tool_id, tp.description;

-- =====================================================
-- PLATINUM TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS platinum (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    weight DECIMAL(10, 4),
    purity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'reserved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    location VARCHAR(255),
    certification_number VARCHAR(100),
    certification_date DATE,
    images TEXT[],
    tags TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_platinum_owner_id ON platinum(owner_id);
CREATE INDEX IF NOT EXISTS idx_platinum_status ON platinum(status);
CREATE INDEX IF NOT EXISTS idx_platinum_value ON platinum(value);
CREATE INDEX IF NOT EXISTS idx_platinum_created_at ON platinum(created_at);
CREATE INDEX IF NOT EXISTS idx_platinum_tags ON platinum USING GIN(tags);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_platinum_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_platinum_updated_at
    BEFORE UPDATE ON platinum
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- LLM TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS llm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    version VARCHAR(50),
    api_endpoint VARCHAR(500),
    api_key_required BOOLEAN DEFAULT true,
    max_tokens INTEGER DEFAULT 4096,
    temperature DECIMAL(3, 2) DEFAULT 0.7,
    context_window INTEGER DEFAULT 4096,
    cost_per_token DECIMAL(10, 8),
    rate_limit_per_minute INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    capabilities JSONB,
    supported_languages TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_llm_provider ON llm(provider);
CREATE INDEX IF NOT EXISTS idx_llm_is_active ON llm(is_active);
CREATE INDEX IF NOT EXISTS idx_llm_created_at ON llm(created_at);
CREATE INDEX IF NOT EXISTS idx_llm_capabilities ON llm USING GIN(capabilities);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE TRIGGER trigger_update_llm_updated_at
    BEFORE UPDATE ON llm
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- This schema supports all features identified in the
-- PROJECT_SCHEMA.md documentation including:
-- - User management with role-based access
-- - Content management system (CMS)
-- - Activity tracking and logging
-- - Tool execution with approvals
-- - AI services (chat, STT, TTS, code execution)
-- - Marketplace and transactions
-- - Analytics and reporting
-- - Task management
-- =====================================================