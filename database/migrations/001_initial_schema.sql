-- ============================================================
-- TradeScope AI — Initial Database Schema
-- Database: Supabase PostgreSQL
-- Version: 1.0.0
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- HELPER: updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- AUTH & USERS
-- ============================================================

-- Note: auth.users is managed by Supabase Auth automatically.
-- This is our public-facing profile table linked to auth.users.

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    country VARCHAR(2),
    base_currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    status VARCHAR(30) DEFAULT 'pending_verification'
        CHECK (status IN ('pending_verification', 'active', 'restricted', 'suspended', 'closed')),
    kyc_status VARCHAR(30) DEFAULT 'not_submitted'
        CHECK (kyc_status IN ('not_submitted', 'pending', 'approved', 'rejected')),
    risk_disclosure_version VARCHAR(20),
    terms_version VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- KYC
-- ============================================================

CREATE TABLE kyc_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'pending'
        CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    risk_level VARCHAR(20) DEFAULT 'medium'
        CHECK (risk_level IN ('low', 'medium', 'high')),
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES user_profiles(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_kyc_profiles_updated_at
    BEFORE UPDATE ON kyc_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kyc_profile_id UUID NOT NULL REFERENCES kyc_profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL
        CHECK (document_type IN ('passport', 'drivers_license', 'utility_bill', 'bank_statement', 'national_id', 'other')),
    storage_path VARCHAR(500) NOT NULL,
    status VARCHAR(30) DEFAULT 'uploaded'
        CHECK (status IN ('uploaded', 'verified', 'rejected')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RBAC
-- ============================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- ============================================================
-- TRADING ACCOUNTS
-- ============================================================

CREATE TABLE trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(30) DEFAULT 'individual'
        CHECK (account_type IN ('individual', 'corporate', 'demo')),
    environment VARCHAR(10) DEFAULT 'demo'
        CHECK (environment IN ('demo', 'live')),
    base_currency VARCHAR(3) DEFAULT 'USD',
    leverage DECIMAL(10,2) DEFAULT 100,
    position_mode VARCHAR(10) DEFAULT 'netting'
        CHECK (position_mode IN ('netting', 'hedging')),
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'active', 'restricted', 'suspended', 'closed')),
    ai_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_trading_accounts_updated_at
    BEFORE UPDATE ON trading_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE account_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID UNIQUE NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    one_click_enabled BOOLEAN DEFAULT FALSE,
    default_order_size DECIMAL DEFAULT 0.01,
    manual_ai_approval BOOLEAN DEFAULT TRUE,
    preferences JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_account_settings_updated_at
    BEFORE UPDATE ON account_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE account_risk_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID UNIQUE NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    risk_profile VARCHAR(20) DEFAULT 'moderate'
        CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')),
    max_daily_trades INTEGER DEFAULT 20,
    max_open_positions INTEGER DEFAULT 5,
    max_position_size DECIMAL DEFAULT 1.0,
    daily_loss_limit DECIMAL DEFAULT 500,
    daily_profit_target DECIMAL DEFAULT 1000,
    max_drawdown DECIMAL DEFAULT 20,
    allowed_instruments JSONB DEFAULT '["*"]',
    allowed_sessions JSONB DEFAULT '["*"]',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES user_profiles(id)
);

CREATE TRIGGER trg_account_risk_limits_updated_at
    BEFORE UPDATE ON account_risk_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MARKET DATA
-- ============================================================

CREATE TABLE instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    asset_class VARCHAR(20) NOT NULL
        CHECK (asset_class IN ('forex', 'stocks', 'indices', 'commodities', 'crypto', 'etf')),
    exchange VARCHAR(50),
    quote_currency VARCHAR(3),
    base_currency VARCHAR(3),
    contract_size DECIMAL DEFAULT 1,
    tick_size DECIMAL DEFAULT 0.00001,
    tick_value DECIMAL DEFAULT 1,
    min_lot_size DECIMAL DEFAULT 0.01,
    max_lot_size DECIMAL DEFAULT 100,
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_instruments_updated_at
    BEFORE UPDATE ON instruments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE market_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    bid DECIMAL NOT NULL,
    ask DECIMAL NOT NULL,
    last DECIMAL,
    high DECIMAL,
    low DECIMAL,
    open DECIMAL,
    volume DECIMAL DEFAULT 0,
    quoted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE candles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    timeframe VARCHAR(5) NOT NULL
        CHECK (timeframe IN ('1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w')),
    open_time TIMESTAMPTZ NOT NULL,
    close_time TIMESTAMPTZ NOT NULL,
    open DECIMAL NOT NULL,
    high DECIMAL NOT NULL,
    low DECIMAL NOT NULL,
    close DECIMAL NOT NULL,
    volume DECIMAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(instrument_id, timeframe, open_time)
);

-- ============================================================
-- ORDERS & EXECUTION
-- ============================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    ai_signal_id UUID,  -- FK added after ai_signals table
    client_order_id VARCHAR(50) NOT NULL,
    provider_order_id VARCHAR(100),
    source VARCHAR(10) NOT NULL DEFAULT 'manual'
        CHECK (source IN ('manual', 'ai')),
    side VARCHAR(4) NOT NULL
        CHECK (side IN ('buy', 'sell')),
    order_type VARCHAR(20) NOT NULL
        CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit')),
    quantity DECIMAL NOT NULL,
    requested_price DECIMAL,
    stop_loss DECIMAL,
    take_profit DECIMAL,
    time_in_force VARCHAR(10) DEFAULT 'gtc'
        CHECK (time_in_force IN ('gtc', 'ioc', 'fok', 'day')),
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'validating', 'accepted', 'submitted', 'partially_filled', 'filled', 'rejected', 'canceled', 'expired', 'failed')),
    idempotency_key VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(account_id, client_order_id)
);

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- IMMUTABLE: order events are never updated or deleted
CREATE TABLE order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    reason TEXT,
    provider_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMMUTABLE: fills are never updated or deleted
CREATE TABLE fills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider_fill_id VARCHAR(100),
    quantity DECIMAL NOT NULL,
    price DECIMAL NOT NULL,
    commission DECIMAL DEFAULT 0,
    commission_currency VARCHAR(3) DEFAULT 'USD',
    filled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- POSITIONS
-- ============================================================

CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    side VARCHAR(4) NOT NULL
        CHECK (side IN ('buy', 'sell')),
    quantity DECIMAL NOT NULL,
    average_entry_price DECIMAL NOT NULL,
    current_price DECIMAL,
    stop_loss DECIMAL,
    take_profit DECIMAL,
    unrealized_pnl DECIMAL DEFAULT 0,
    realized_pnl DECIMAL DEFAULT 0,
    total_commission DECIMAL DEFAULT 0,
    total_financing DECIMAL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'open'
        CHECK (status IN ('open', 'closing', 'closed')),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_positions_updated_at
    BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- IMMUTABLE: position events are never updated or deleted
CREATE TABLE position_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    event_type VARCHAR(30) NOT NULL
        CHECK (event_type IN ('opened', 'partial_close', 'sl_modified', 'tp_modified', 'fully_closed', 'reversed')),
    quantity DECIMAL NOT NULL,
    price DECIMAL NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI ENGINE
-- ============================================================

CREATE TABLE ai_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    version VARCHAR(20) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'inactive'
        CHECK (status IN ('active', 'inactive', 'testing')),
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_ai_strategies_updated_at
    BEFORE UPDATE ON ai_strategies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE ai_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID UNIQUE NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    risk_profile VARCHAR(20) DEFAULT 'moderate'
        CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')),
    enabled BOOLEAN DEFAULT FALSE,
    auto_trade BOOLEAN DEFAULT FALSE,
    minimum_confidence DECIMAL(3,2) DEFAULT 0.70
        CHECK (minimum_confidence >= 0 AND minimum_confidence <= 1),
    settings JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_ai_profiles_updated_at
    BEFORE UPDATE ON ai_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE ai_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'running'
        CHECK (status IN ('running', 'paused', 'stopped', 'error')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    stopped_at TIMESTAMPTZ,
    stop_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    strategy_id UUID NOT NULL REFERENCES ai_strategies(id),
    session_id UUID REFERENCES ai_sessions(id),
    direction VARCHAR(6) NOT NULL
        CHECK (direction IN ('BUY', 'SELL', 'NEUTRAL')),
    confidence DECIMAL(3,2) NOT NULL
        CHECK (confidence >= 0 AND confidence <= 1),
    entry_price DECIMAL NOT NULL,
    stop_loss DECIMAL NOT NULL,
    take_profit DECIMAL NOT NULL,
    risk_reward_ratio DECIMAL(5,2),
    suggested_quantity DECIMAL NOT NULL,
    status VARCHAR(20) DEFAULT 'proposed'
        CHECK (status IN ('proposed', 'risk_reviewed', 'approved', 'rejected', 'expired', 'executed')),
    reason_codes JSONB DEFAULT '[]',
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Now add the FK from orders to ai_signals
ALTER TABLE orders ADD CONSTRAINT fk_orders_ai_signal
    FOREIGN KEY (ai_signal_id) REFERENCES ai_signals(id);

-- IMMUTABLE: AI decisions are never updated or deleted
CREATE TABLE ai_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signal_id UUID NOT NULL REFERENCES ai_signals(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES ai_sessions(id),
    model_version VARCHAR(50),
    strategy_version VARCHAR(20),
    input_snapshot JSONB,
    risk_checks JSONB,
    decision VARCHAR(20) NOT NULL
        CHECK (decision IN ('approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS & FINANCE
-- ============================================================

CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL
        CHECK (type IN ('bank_transfer', 'card', 'crypto')),
    provider VARCHAR(50) NOT NULL,
    masked_identifier VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    provider_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
    amount DECIMAL NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    fee DECIMAL DEFAULT 0,
    net_amount DECIMAL GENERATED ALWAYS AS (amount - fee) STORED,
    provider_reference VARCHAR(200),
    status VARCHAR(30) DEFAULT 'created'
        CHECK (status IN ('created', 'awaiting_payment', 'processing', 'pending_review', 'completed', 'failed', 'canceled', 'refunded')),
    idempotency_key VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_deposits_updated_at
    BEFORE UPDATE ON deposits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
    amount DECIMAL NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    fee DECIMAL DEFAULT 0,
    net_amount DECIMAL GENERATED ALWAYS AS (amount - fee) STORED,
    provider_reference VARCHAR(200),
    status VARCHAR(30) DEFAULT 'requested'
        CHECK (status IN ('requested', 'pending_review', 'approved', 'processing', 'completed', 'rejected', 'canceled', 'failed')),
    reviewed_by UUID REFERENCES user_profiles(id),
    review_reason TEXT,
    rejection_reason TEXT,
    idempotency_key VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_withdrawals_updated_at
    BEFORE UPDATE ON withdrawals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- IMMUTABLE: transactions are never updated or deleted
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    deposit_id UUID REFERENCES deposits(id),
    withdrawal_id UUID REFERENCES withdrawals(id),
    transaction_type VARCHAR(30) NOT NULL
        CHECK (transaction_type IN ('deposit', 'withdrawal', 'trade_settlement', 'commission', 'spread_charge', 'financing', 'admin_adjustment', 'refund', 'bonus')),
    amount DECIMAL NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'failed')),
    reference VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOUBLE-ENTRY LEDGER
-- ============================================================

CREATE TABLE ledger_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trading_account_id UUID REFERENCES trading_accounts(id) ON DELETE CASCADE,
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(30) NOT NULL
        CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMMUTABLE once posted: ledger journals
CREATE TABLE ledger_journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_type VARCHAR(50) NOT NULL,
    reference_id UUID NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'posted', 'reversed')),
    posted_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMMUTABLE: ledger entries are never updated or deleted
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID NOT NULL REFERENCES ledger_journals(id) ON DELETE CASCADE,
    ledger_account_id UUID NOT NULL REFERENCES ledger_accounts(id),
    entry_type VARCHAR(6) NOT NULL
        CHECK (entry_type IN ('debit', 'credit')),
    amount DECIMAL NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    journal_id UUID REFERENCES ledger_journals(id),
    amount DECIMAL NOT NULL,
    adjustment_type VARCHAR(30) NOT NULL
        CHECK (adjustment_type IN ('credit_correction', 'debit_correction', 'promotional_credit', 'fee_reversal', 'trade_correction', 'refund', 'manual_settlement')),
    reason TEXT NOT NULL,
    supporting_evidence VARCHAR(500),
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    approved_by UUID REFERENCES user_profiles(id),
    status VARCHAR(20) DEFAULT 'pending_approval'
        CHECK (status IN ('pending_approval', 'approved', 'rejected', 'posted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_admin_adjustments_updated_at
    BEFORE UPDATE ON admin_adjustments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PORTFOLIO & METRICS
-- ============================================================

CREATE TABLE portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    balance DECIMAL NOT NULL DEFAULT 0,
    equity DECIMAL NOT NULL DEFAULT 0,
    buying_power DECIMAL NOT NULL DEFAULT 0,
    used_margin DECIMAL NOT NULL DEFAULT 0,
    free_margin DECIMAL NOT NULL DEFAULT 0,
    realized_pnl DECIMAL NOT NULL DEFAULT 0,
    unrealized_pnl DECIMAL NOT NULL DEFAULT 0,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_account_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    trades_count INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    realized_pnl DECIMAL DEFAULT 0,
    max_drawdown DECIMAL DEFAULT 0,
    total_commission DECIMAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(account_id, metric_date)
);

-- ============================================================
-- LIVE TRADERS (Anonymous Leaderboard)
-- ============================================================

CREATE TABLE public_trader_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID UNIQUE NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    public_trader_code VARCHAR(10) UNIQUE NOT NULL,
    leaderboard_enabled BOOLEAN DEFAULT FALSE,
    public_risk_profile VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_public_trader_profiles_updated_at
    BEFORE UPDATE ON public_trader_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_trader_id UUID NOT NULL REFERENCES public_trader_profiles(id) ON DELETE CASCADE,
    period VARCHAR(10) NOT NULL
        CHECK (period IN ('today', 'week', 'month', 'all_time')),
    rank INTEGER NOT NULL,
    score DECIMAL NOT NULL,
    profit DECIMAL DEFAULT 0,
    return_percentage DECIMAL DEFAULT 0,
    win_rate DECIMAL DEFAULT 0,
    drawdown DECIMAL DEFAULT 0,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE robot_activity_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_trader_id UUID NOT NULL REFERENCES public_trader_profiles(id) ON DELETE CASCADE,
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    activity_type VARCHAR(30) NOT NULL
        CHECK (activity_type IN ('opened', 'closed', 'modified_sl', 'modified_tp')),
    direction VARCHAR(4)
        CHECK (direction IN ('buy', 'sell')),
    public_profit DECIMAL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTENT & COMMUNICATION
-- ============================================================

CREATE TABLE news_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL,
    external_id VARCHAR(200) NOT NULL,
    headline VARCHAR(500) NOT NULL,
    summary TEXT,
    source_url VARCHAR(1000),
    sentiment VARCHAR(10)
        CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    impact_level VARCHAR(10)
        CHECK (impact_level IN ('low', 'medium', 'high')),
    related_symbols JSONB DEFAULT '[]',
    published_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, external_id)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    payload JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    channel VARCHAR(20) DEFAULT 'in_app'
        CHECK (channel IN ('in_app', 'email', 'sms', 'push')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PLATFORM CONFIG
-- ============================================================

CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(30) NOT NULL
        CHECK (category IN ('trading', 'deposits', 'withdrawals', 'fees', 'risk', 'application')),
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    updated_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category, setting_key)
);

CREATE TRIGGER trg_platform_settings_updated_at
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE user_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    override_type VARCHAR(50) NOT NULL,
    override_value JSONB NOT NULL,
    reason TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_user_overrides_updated_at
    BEFORE UPDATE ON user_overrides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- EMERGENCY & RISK
-- ============================================================

CREATE TABLE emergency_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scope VARCHAR(20) NOT NULL
        CHECK (scope IN ('pause_ai_trades', 'cancel_ai_orders', 'close_ai_positions', 'global_halt')),
    action VARCHAR(20) NOT NULL
        CHECK (action IN ('triggered', 'cleared')),
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'cleared')),
    reason TEXT NOT NULL,
    affected_accounts JSONB DEFAULT NULL,
    triggered_by UUID NOT NULL REFERENCES user_profiles(id),
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cleared_at TIMESTAMPTZ,
    cleared_by UUID REFERENCES user_profiles(id),
    result JSONB,
    failed_actions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMMUTABLE: risk events are never updated or deleted
CREATE TABLE risk_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES trading_accounts(id),
    order_id UUID REFERENCES orders(id),
    event_type VARCHAR(30) NOT NULL
        CHECK (event_type IN ('margin_call', 'stop_out', 'daily_loss_breach', 'exposure_limit', 'emergency_stop', 'ai_disabled', 'volatility_halt', 'order_rejected')),
    severity VARCHAR(10) NOT NULL DEFAULT 'info'
        CHECK (severity IN ('info', 'warning', 'critical')),
    reason TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT & SYSTEM
-- ============================================================

-- IMMUTABLE: audit logs are never updated or deleted
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID REFERENCES user_profiles(id),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    previous_value JSONB,
    new_value JSONB,
    reason TEXT,
    ip_address INET,
    user_agent VARCHAR(500),
    correlation_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL,
    external_event_id VARCHAR(200) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    processing_status VARCHAR(20) DEFAULT 'received'
        CHECK (processing_status IN ('received', 'processing', 'completed', 'failed', 'skipped')),
    attempt_count INTEGER DEFAULT 1,
    error_message TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, external_event_id)
);

CREATE TABLE idempotency_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    idempotency_key VARCHAR(100) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    response_data JSONB,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, idempotency_key)
);
