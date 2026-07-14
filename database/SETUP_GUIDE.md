# TradeScope AI — Database Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → Sign in → **New Project**
2. Fill in:
   - **Name:** `TradeScope AI PRO`
   - **Database Password:** (generate a strong one, save it)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier (upgrade when needed)
3. Click **Create Project** → Wait ~2 minutes for provisioning

---

## Step 2: Run Migrations (via Supabase SQL Editor)

### Option A: Using Supabase Dashboard (Recommended for now)

1. Open your Supabase project → **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy-paste the ENTIRE contents of these files, **IN ORDER**:
   - `database/migrations/001_initial_schema.sql` → **Run**
   - `database/migrations/002_indexes.sql` → **Run**
   - `database/seeds/001_seed_roles_permissions.sql` → **Run**
   - `database/seeds/002_seed_instruments.sql` → **Run**
   - `database/seeds/003_seed_ledger_accounts.sql` → **Run**

### Option B: Using Supabase CLI (for later CI/CD)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

---

## Step 3: Verify Setup

Run these queries in SQL Editor to verify everything:

```sql
-- Check all tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show: 35 tables

-- Check roles seeded
SELECT code, name FROM roles;
-- Should show: 7 roles

-- Check instruments seeded
SELECT symbol, name, asset_class FROM instruments;
-- Should show: 27 instruments

-- Check permissions seeded
SELECT COUNT(*) FROM permissions;
-- Should show: 36 permissions
```

---

## Step 4: Configure Supabase Auth

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**:
   - Enable **Email/Password signup**
   - Disable **Confirm email** for development (re-enable for production)
3. Under **Email Templates** — customize if needed
4. Note your:
   - **Project URL:** `https://dzvsdphddukzxqamzktc.supabase.co`
   - **Anon Key:** (anon public  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dnNkcGhkZHVrenhxYW16a3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MzM3NzQsImV4cCI6MjA5OTUwOTc3NH0.vbJSv9oYSTbE7JxWvH0zjBQmRAstTNcCFPfQomWZ4c0)
   - **Service Role Key:** (service_role  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dnNkcGhkZHVrenhxYW16a3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzkzMzc3NCwiZXhwIjoyMDk5NTA5Nzc0fQ.TltSTf1euBLw-GGh7aeSPZPhG--EN_7df5DMTcxUbMA)

---

## Step 5: Configure Environment Variables

Create a `.env` file in your backend directory:

```env
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
DATABASE_URL=postgresql://postgres:<password>@db.<project-id>.supabase.co:5432/postgres
REDIS_URL=redis://localhost:6379  # For later
JWT_SECRET=your-jwt-secret
```

Create a `.env` file in your frontend directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:8000/ws/v1
```

---

## Step 6: Row Level Security (RLS) — Add Later

After the schema is working, we'll add RLS policies. Basic outline:

```sql
-- Example: Users can only see their own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth_user_id = auth.uid());

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
ON user_profiles FOR SELECT
USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
));
```

We'll complete RLS as part of **Module 2 (RBAC)**.

---

## File Structure After Setup

```
TradeScope AI PRO/
├── database/
│   ├── SETUP_GUIDE.md          ← You are here
│   ├── migrations/
│   │   ├── 001_initial_schema.sql   ← 35 tables
│   │   └── 002_indexes.sql          ← Performance indexes
│   └── seeds/
│       ├── 001_seed_roles_permissions.sql  ← 7 roles, 36 permissions
│       ├── 002_seed_instruments.sql        ← 27 instruments
│       └── 003_seed_ledger_accounts.sql    ← Chart of accounts
├── ERD.md                      ← Entity relationship reference
├── IMPLEMENTATION_PLAN.md      ← 20 module plan
└── TradeScope AI Development Plan (1).pdf  ← Original reference
```

---

## Quick Reference: Table Count by Category

| Category | Tables |
|---|---|
| Auth & Users | `user_profiles` |
| KYC | `kyc_profiles`, `kyc_documents` |
| RBAC | `roles`, `permissions`, `user_roles`, `role_permissions` |
| Trading Accounts | `trading_accounts`, `account_settings`, `account_risk_limits` |
| Market Data | `instruments`, `market_quotes`, `candles` |
| Orders | `orders`, `order_events`, `fills` |
| Positions | `positions`, `position_events` |
| AI Engine | `ai_profiles`, `ai_strategies`, `ai_sessions`, `ai_signals`, `ai_decisions` |
| Payments | `payment_methods`, `deposits`, `withdrawals`, `transactions` |
| Ledger | `ledger_accounts`, `ledger_journals`, `ledger_entries`, `admin_adjustments` |
| Portfolio | `portfolio_snapshots`, `daily_account_metrics` |
| Live Traders | `public_trader_profiles`, `leaderboard_snapshots`, `robot_activity_events` |
| Content | `news_items`, `notifications` |
| Config | `platform_settings`, `user_overrides` |
| Risk & Control | `emergency_controls`, `risk_events` |
| System | `audit_logs`, `webhook_events`, `idempotency_keys` |
| **Total** | **35 tables** |
