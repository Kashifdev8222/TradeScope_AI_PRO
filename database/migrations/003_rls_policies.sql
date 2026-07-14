-- ============================================================
-- TradeScope AI — RLS Policies (Module 2: RBAC)
-- Version: 1.0.0
-- ============================================================
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. USER_PROFILES
-- ============================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow: user can read their own profile
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
USING (auth_user_id = auth.uid());

-- Allow: user can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Allow: insert during registration (auth.uid() matches auth_user_id)
CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth_user_id = auth.uid());

-- Allow: service_role (backend) full access
CREATE POLICY "Service role full access"
ON user_profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 2. KYC_PROFILES
-- ============================================================
ALTER TABLE kyc_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own KYC"
ON kyc_profiles FOR SELECT
USING (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
));

CREATE POLICY "Users can insert own KYC"
ON kyc_profiles FOR INSERT
WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
));

CREATE POLICY "Service role full access"
ON kyc_profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 3. KYC_DOCUMENTS
-- ============================================================
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own KYC docs"
ON kyc_documents FOR SELECT
USING (kyc_profile_id IN (
    SELECT id FROM kyc_profiles WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Users can insert own KYC docs"
ON kyc_documents FOR INSERT
WITH CHECK (kyc_profile_id IN (
    SELECT id FROM kyc_profiles WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Service role full access"
ON kyc_documents FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 4. TRADING_ACCOUNTS
-- ============================================================
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own accounts"
ON trading_accounts FOR SELECT
USING (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
));

CREATE POLICY "Users can create own accounts"
ON trading_accounts FOR INSERT
WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
));

CREATE POLICY "Service role full access"
ON trading_accounts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 5. ACCOUNT_SETTINGS
-- ============================================================
ALTER TABLE account_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
ON account_settings FOR SELECT
USING (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Service role full access"
ON account_settings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 6. ACCOUNT_RISK_LIMITS
-- ============================================================
ALTER TABLE account_risk_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own risk limits"
ON account_risk_limits FOR SELECT
USING (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Service role full access"
ON account_risk_limits FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 7. PAYMENT_METHODS
-- ============================================================
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payment methods"
ON payment_methods FOR SELECT
USING (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
));

CREATE POLICY "Users can create own payment methods"
ON payment_methods FOR INSERT
WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
));

CREATE POLICY "Users can update own payment methods"
ON payment_methods FOR UPDATE
USING (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
));

CREATE POLICY "Service role full access"
ON payment_methods FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 8. ORDERS
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
ON orders FOR SELECT
USING (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Users can create own orders"
ON orders FOR INSERT
WITH CHECK (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Service role full access"
ON orders FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 9. POSITIONS
-- ============================================================
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own positions"
ON positions FOR SELECT
USING (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Service role full access"
ON positions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 10. DEPOSITS
-- ============================================================
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own deposits"
ON deposits FOR SELECT
USING (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Users can create own deposits"
ON deposits FOR INSERT
WITH CHECK (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Service role full access"
ON deposits FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 11. WITHDRAWALS
-- ============================================================
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own withdrawals"
ON withdrawals FOR SELECT
USING (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Users can create own withdrawals"
ON withdrawals FOR INSERT
WITH CHECK (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Service role full access"
ON withdrawals FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 12. TRANSACTIONS
-- ============================================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
ON transactions FOR SELECT
USING (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Service role full access"
ON transactions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 13. NOTIFICATIONS
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
USING (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
));

CREATE POLICY "Service role full access"
ON notifications FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 14. AI_PROFILES
-- ============================================================
ALTER TABLE ai_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own AI profile"
ON ai_profiles FOR SELECT
USING (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Service role full access"
ON ai_profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 15. PUBLIC_TRADER_PROFILES
-- ============================================================
ALTER TABLE public_trader_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can see public profiles"
ON public_trader_profiles FOR SELECT
USING (leaderboard_enabled = true);

CREATE POLICY "Users can manage own public profile"
ON public_trader_profiles FOR ALL
USING (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));

CREATE POLICY "Service role full access"
ON public_trader_profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 16. ROLES & PERMISSIONS (admin-only tables)
-- ============================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Only service_role can modify roles/permissions
CREATE POLICY "Service role manages roles"
ON roles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role manages permissions"
ON permissions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role manages user_roles"
ON user_roles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role manages role_permissions"
ON role_permissions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Everyone authenticated can read roles/permissions
CREATE POLICY "Authenticated users can read roles"
ON roles FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read permissions"
ON permissions FOR SELECT
USING (auth.role() = 'authenticated');

-- ============================================================
-- 17. IMMUTABLE / SYSTEM TABLES
-- These are backend-only; service_role controls them
-- ============================================================

-- ORDER_EVENTS, FILLS, POSITION_EVENTS - backend only
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages order_events"
ON order_events FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE fills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages fills"
ON fills FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE position_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages position_events"
ON position_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- LEDGER - backend only
ALTER TABLE ledger_journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages journals"
ON ledger_journals FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages entries"
ON ledger_entries FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE ledger_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages ledger accounts"
ON ledger_accounts FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE admin_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages adjustments"
ON admin_adjustments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- AUDIT - backend only, immutable
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages audit logs"
ON audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RISK & EMERGENCY - backend only
ALTER TABLE risk_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages risk events"
ON risk_events FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE emergency_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages emergency controls"
ON emergency_controls FOR ALL TO service_role USING (true) WITH CHECK (true);

-- WEBHOOK - backend only
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages webhooks"
ON webhook_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- IDEMPOTENCY - backend only
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages idempotency keys"
ON idempotency_keys FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 18. PUBLIC READ TABLES
-- These tables are readable by everyone
-- ============================================================

-- Instruments - everyone can read, only backend can modify
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read instruments"
ON instruments FOR SELECT USING (true);
CREATE POLICY "Service role manages instruments"
ON instruments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Market Quotes - everyone can read
ALTER TABLE market_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read quotes"
ON market_quotes FOR SELECT USING (true);
CREATE POLICY "Service role manages quotes"
ON market_quotes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Candles - everyone can read
ALTER TABLE candles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read candles"
ON candles FOR SELECT USING (true);
CREATE POLICY "Service role manages candles"
ON candles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- News Items - everyone can read
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read news"
ON news_items FOR SELECT USING (true);
CREATE POLICY "Service role manages news"
ON news_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Leaderboard - everyone can read
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read leaderboard"
ON leaderboard_snapshots FOR SELECT USING (true);
CREATE POLICY "Service role manages leaderboard"
ON leaderboard_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Robot Activity - everyone can read
ALTER TABLE robot_activity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read robot activity"
ON robot_activity_events FOR SELECT USING (true);
CREATE POLICY "Service role manages robot activity"
ON robot_activity_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 19. CONFIG TABLES - backend only
-- ============================================================
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages platform settings"
ON platform_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE user_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages overrides"
ON user_overrides FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 20. PORTFOLIO & METRICS - user can read own
-- ============================================================
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own snapshots"
ON portfolio_snapshots FOR SELECT
USING (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));
CREATE POLICY "Service role manages snapshots"
ON portfolio_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE daily_account_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own metrics"
ON daily_account_metrics FOR SELECT
USING (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));
CREATE POLICY "Service role manages metrics"
ON daily_account_metrics FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 21. AI TABLES - user can read own
-- ============================================================
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own AI sessions"
ON ai_sessions FOR SELECT
USING (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));
CREATE POLICY "Service role manages AI sessions"
ON ai_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE ai_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own AI signals"
ON ai_signals FOR SELECT
USING (account_id IN (
    SELECT id FROM trading_accounts WHERE user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
));
CREATE POLICY "Service role manages AI signals"
ON ai_signals FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE ai_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages AI decisions"
ON ai_decisions FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE ai_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read strategies"
ON ai_strategies FOR SELECT USING (true);
CREATE POLICY "Service role manages strategies"
ON ai_strategies FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- DONE
-- Verify: SELECT tablename FROM pg_tables WHERE schemaname='public'
--          AND rowsecurity = true ORDER BY tablename;
-- Should show 35 tables with RLS enabled
-- ============================================================
