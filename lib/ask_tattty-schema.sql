-- Core Tables for Ask Tattty Analytics System

-- Table for tracking all requests made to the Ask Tattty system
CREATE TABLE IF NOT EXISTS ask_tattty_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    keyholder_id VARCHAR(255), -- Changed from user_id to keyholder_id
    action_type VARCHAR(50) NOT NULL, -- 'ideas', 'content', 'config', 'analytics', etc.
    request_payload JSONB,
    response_payload JSONB,
    status VARCHAR(20) DEFAULT 'completed',
    tokens_used INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for Ask Tattty configuration settings
CREATE TABLE IF NOT EXISTS ask_tattty_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255), -- keyholder_id
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for Ask Tattty generated content
CREATE TABLE IF NOT EXISTS ask_tattty_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    keyholder_id VARCHAR(255), -- Changed from user_id to keyholder_id
    content_type VARCHAR(50) NOT NULL, -- 'idea', 'strategy', 'analysis', 'insight'
    content_title VARCHAR(255),
    content_body TEXT NOT NULL,
    metadata JSONB,
    is_archived BOOLEAN DEFAULT FALSE,
    tokens_generated INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for keyholder sessions (renamed from user_sessions)
CREATE TABLE IF NOT EXISTS keyholder_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    keyholder_id VARCHAR(255), -- Changed from user_id to keyholder_id
    ip_address VARCHAR(45),
    user_agent TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active',
    total_requests INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0
);

-- Table for keyholder profiles (renamed from users)
CREATE TABLE IF NOT EXISTS keyholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyholder_id VARCHAR(255) NOT NULL UNIQUE, -- Changed from user_id
    email VARCHAR(255),
    name VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    total_tokens_used INTEGER DEFAULT 0,
    total_requests INTEGER DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ask_tattty_requests_session ON ask_tattty_requests(session_id);
CREATE INDEX IF NOT EXISTS idx_ask_tattty_requests_keyholder ON ask_tattty_requests(keyholder_id);
CREATE INDEX IF NOT EXISTS idx_ask_tattty_requests_action ON ask_tattty_requests(action_type);
CREATE INDEX IF NOT EXISTS idx_ask_tattty_requests_created ON ask_tattty_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_ask_tattty_content_session ON ask_tattty_content(session_id);
CREATE INDEX IF NOT EXISTS idx_ask_tattty_content_keyholder ON ask_tattty_content(keyholder_id);
CREATE INDEX IF NOT EXISTS idx_ask_tattty_content_type ON ask_tattty_content(content_type);

CREATE INDEX IF NOT EXISTS idx_keyholder_sessions_keyholder ON keyholder_sessions(keyholder_id);
CREATE INDEX IF NOT EXISTS idx_keyholder_sessions_status ON keyholder_sessions(status);

-- Insert default configuration
INSERT INTO ask_tattty_config (config_key, config_value, description) VALUES
('analytics_enabled', 'true', 'Enable analytics tracking'),
('max_requests_per_session', '100', 'Maximum requests allowed per session'),
('token_cost_per_request', '1', 'Tokens consumed per request'),
('session_timeout_minutes', '30', 'Session inactivity timeout'),
('retention_days', '90', 'Data retention period in days')
ON CONFLICT (config_key) DO NOTHING;