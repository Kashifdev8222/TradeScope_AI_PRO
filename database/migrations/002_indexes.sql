-- ============================================================
-- TradeScope AI — Indexes
-- Version: 1.0.0
-- ============================================================

-- Market Data
CREATE INDEX IF NOT EXISTS idx_candles_lookup ON candles (instrument_id, timeframe, open_time DESC);
CREATE INDEX IF NOT EXISTS idx_candles_close_time ON candles (close_time DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_instrument ON market_quotes (instrument_id, quoted_at DESC);

-- Orders & Execution
CREATE INDEX IF NOT EXISTS idx_orders_account ON orders (account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status, updated_at);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events (order_id, created_at);
CREATE INDEX IF NOT EXISTS idx_fills_order ON fills (order_id);

-- Positions
CREATE INDEX IF NOT EXISTS idx_positions_account ON positions (account_id, status);
CREATE INDEX IF NOT EXISTS idx_positions_open ON positions (status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_position_events_position ON position_events (position_id, created_at);

-- AI Engine
CREATE INDEX IF NOT EXISTS idx_signals_account ON ai_signals (account_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_valid ON ai_signals (valid_until) WHERE status IN ('proposed', 'risk_reviewed');
CREATE INDEX IF NOT EXISTS idx_signals_session ON ai_signals (session_id);
CREATE INDEX IF NOT EXISTS idx_decisions_signal ON ai_decisions (signal_id);
CREATE INDEX IF NOT EXISTS idx_decisions_session ON ai_decisions (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_account ON ai_sessions (account_id, status);

-- Finance & Payments
CREATE INDEX IF NOT EXISTS idx_deposits_account ON deposits (account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits (status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_account ON withdrawals (account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_review ON withdrawals (status) WHERE status = 'pending_review';
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions (account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (transaction_type, created_at DESC);

-- Ledger
CREATE INDEX IF NOT EXISTS idx_ledger_entries_journal ON ledger_entries (journal_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_account ON ledger_entries (ledger_account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_journals_reference ON ledger_journals (reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_ledger_journals_created ON ledger_journals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_adjustments_account ON admin_adjustments (account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_adjustments_status ON admin_adjustments (status) WHERE status = 'pending_approval';

-- Portfolio & Metrics
CREATE INDEX IF NOT EXISTS idx_snapshots_account ON portfolio_snapshots (account_id, captured_at DESC);

-- Leaderboard
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard_snapshots (period, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_trader ON leaderboard_snapshots (public_trader_id, period);
CREATE INDEX IF NOT EXISTS idx_robot_events_trader ON robot_activity_events (public_trader_id, occurred_at DESC);

-- News & Notifications
CREATE INDEX IF NOT EXISTS idx_news_published ON news_items (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_provider ON news_items (provider, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read, created_at DESC);

-- Audit
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs (actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs (action, created_at DESC);

-- Webhooks
CREATE INDEX IF NOT EXISTS idx_webhook_status ON webhook_events (processing_status, received_at DESC);

-- Idempotency
-- Note: For cleanup queries, filter with: WHERE expires_at < NOW()
CREATE INDEX IF NOT EXISTS idx_idempotency_expiry ON idempotency_keys (expires_at);

-- User lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth ON user_profiles (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles (status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_client_code ON user_profiles (client_code);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user ON trading_accounts (user_id, status);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_number ON trading_accounts (account_number);
