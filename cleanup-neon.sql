-- =====================================================
-- NEON DATABASE CLEANUP - REMOVE TOKEN/SUBSCRIPTION SYSTEM
-- =====================================================
-- Commands to remove complex token/credit/subscription tables
-- while keeping essential tables for the simplified license key system
-- =====================================================

-- TABLES TO DROP (Token/Credit System):
DROP TABLE IF EXISTS token_pack_costs;
DROP TABLE IF EXISTS user_tokens;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS pricing_products;
DROP TABLE IF EXISTS pricing_features;
DROP TABLE IF EXISTS product_features;
DROP TABLE IF EXISTS regeneration_discounts;
DROP TABLE IF EXISTS trust_scores;
DROP TABLE IF EXISTS ui_badges;
DROP TABLE IF EXISTS safety_events;
DROP TABLE IF EXISTS control_adder_costs;

-- Complex payment/tracking tables to drop:
DROP TABLE IF EXISTS agent_events;
DROP TABLE IF EXISTS agent_sessions;
DROP TABLE IF EXISTS agent_tasks;
DROP TABLE IF EXISTS agent_tool_invocations;
DROP TABLE IF EXISTS api_request_logs;
DROP TABLE IF EXISTS edit_tool_costs;
DROP TABLE IF EXISTS feature_usage_logs;
DROP TABLE IF EXISTS model_costs;
DROP TABLE IF EXISTS trusted_users;
DROP TABLE IF EXISTS takeover_request;
DROP TABLE IF EXISTS takeover_request_status;

-- Role-based access complexity (simplified to just OTP email verification):
DROP TABLE IF EXISTS role_permissions;

-- =====================================================
-- TABLES TO KEEP (Essential for New License Key Model):
-- =====================================================
-- users (for OTP verification)
-- user_sessions (simplified session tracking)
-- generations (usage tracking)
-- activity_events (business analytics)
-- usage_counters (generation limits tracking)
-- generation_transactions (revenue tracking)
-- generation_assets (outputs storage)
-- system_config (basic settings)
-- feature_flags (simple admin toggles)

-- =====================================================
-- SIMPLIFIED TABLES TO CREATE (for license key system):
-- =====================================================

-- License key management (replaces complex token system)
CREATE TABLE IF NOT EXISTS license_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_key VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    daily_limit INTEGER DEFAULT 5,
    daily_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simple daily usage tracking
CREATE TABLE IF NOT EXISTS daily_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_key VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(license_key, date)
);

-- =====================================================
-- INDEXES FOR LICENSE SYSTEM
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_license_keys_key ON license_keys(license_key);
CREATE INDEX IF NOT EXISTS idx_license_keys_email ON license_keys(email);
CREATE INDEX IF NOT EXISTS idx_license_keys_active ON license_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON daily_usage(date);
CREATE INDEX IF NOT EXISTS idx_daily_usage_key ON daily_usage(license_key);

-- Table for storing generated image metadata and Blob URLs
CREATE TABLE IF NOT EXISTS generation_assets (
    id VARCHAR(255) PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    model VARCHAR(100) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    steps INTEGER NOT NULL,
    guidance_scale DECIMAL(3,1) NOT NULL,
    blob_url TEXT NOT NULL,
    upscaled_url TEXT,
    file_size INTEGER NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for image storage
CREATE INDEX IF NOT EXISTS idx_generation_assets_email ON generation_assets(user_email);
CREATE INDEX IF NOT EXISTS idx_generation_assets_created ON generation_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_assets_tags ON generation_assets USING GIN(tags);

-- =====================================================
-- CLEANUP COMPLETE MESSAGE
-- =====================================================
-- Next steps:
-- 1. Run this SQL in Neon console
-- 2. The admin dashboard will continue working
-- 3. User-facing website will use simple license key verification
