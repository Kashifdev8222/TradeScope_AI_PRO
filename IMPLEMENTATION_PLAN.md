# TradeScope AI — Complete Implementation Plan

> **Goal:** Learn and implement TradeScope AI module by module, starting from foundation to production.
> **Approach:** Modular monolith first → split services later if needed.
> **Modes:** Demo/Simulation first → Live Broker adapters later.

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | Expo SDK 56, React Native, React Native Web, TypeScript, Expo Router, TanStack Query, Zustand, Cloudflare Pages |
| Backend | FastAPI, Python 3.12, Pydantic, SQLAlchemy + Supabase client, REST + WebSockets, Render |
| Database | Supabase PostgreSQL (Auth, Storage, RLS, Realtime) + Redis |
| External | Market Data Provider, Broker API, Payment Gateways, News Feeds, Email/SMS/Push |

---

## MODULE 0: Project Setup & Foundation

### 0.1 Project Scaffolding
- [ ] Initialize Expo (SDK 56) frontend with TypeScript
- [ ] Set up Expo Router for file-based routing (`/client/*` and `/admin/*`)
- [ ] Initialize FastAPI backend with Python 3.12
- [ ] Set up Supabase project (PostgreSQL + Auth + Storage)
- [ ] Configure development, staging, production environments
- [ ] Set up Cloudflare Pages (frontend) and Render (backend) deployment
- [ ] Set up Redis for caching/queues (can be local/dev first)

### 0.2 Shared Infrastructure
- [ ] TanStack Query setup for API state management
- [ ] Zustand setup for local trading state
- [ ] WebSocket client setup for live updates
- [ ] Structured JSON logging (request ID, user ID, service, event, duration)
- [ ] Rate limiting middleware
- [ ] CORS configuration
- [ ] Request-size limits
- [ ] Input validation (Pydantic)
- [ ] Error handling framework

### 0.3 CI/CD Pipeline
- [ ] TypeScript lint + Python lint
- [ ] Type checking
- [ ] Unit tests + Integration tests
- [ ] Database migration validation
- [ ] Security/dependency scan
- [ ] Frontend + Backend builds
- [ ] Staging → Smoke tests → Migration dry run → Production deploy

---

## MODULE 1: Authentication & User Foundation

### 1.1 Supabase Auth Integration
- [ ] Registration with email/password
- [ ] Login / Logout
- [ ] Email verification
- [ ] Forgot password / Reset password flow
- [ ] JWT validation (server-side verify)
- [ ] Refresh-token rotation
- [ ] Session management (list sessions, revoke session)
- [ ] Device/session history
- [ ] Brute-force rate limiting on login/registration

### 1.2 User Profiles
- [ ] `USER_PROFILES` table (full_name, email, phone, country, base_currency, timezone, status, kyc_status)
- [ ] `AUTH_USERS` table (linked to Supabase Auth)
- [ ] Profile CRUD APIs (`GET /client/profile`, `PATCH /client/profile`)
- [ ] Account statuses: `pending_verification`, `active`, `restricted`, `suspended`, `closed`

### 1.3 KYC Foundation
- [ ] `KYC_PROFILES` table (status, risk_level, submitted_at, reviewed_at, reviewed_by)
- [ ] `KYC_DOCUMENTS` table (document_type, storage_path, status)
- [ ] KYC submission flow (`GET /client/kyc`, `POST /client/kyc`, `POST /client/kyc/documents`)
- [ ] Secure document storage in Supabase Storage (private bucket, signed URLs)

### 1.4 Security Requirements
- [ ] TLS everywhere
- [ ] Encrypted secrets
- [ ] Sensitive tokens encrypted at rest
- [ ] Suspicious login notifications
- [ ] Re-authentication for sensitive changes
- [ ] Terms & risk-disclosure acceptance tracking

---

## MODULE 2: User Roles & Access Control (RBAC)

### 2.1 Role System
- [ ] `ROLES` table (code, name)
- [ ] `PERMISSIONS` table (code, name)
- [ ] `USER_ROLES` table (user_id → role_id)
- [ ] `ROLE_PERMISSIONS` table (role_id → permission_id)

### 2.2 Role Definitions
| Role | Scope |
|---|---|
| **Super Admin** | Full platform control |
| **User Administrator** | Create/update users, activate/suspend, AI enable/disable |
| **Finance Administrator** | Deposit review, withdrawal approve/reject, balance adjustments, ledger access |
| **Risk Manager** | User risk limits, global trade limits, emergency stop, margin/exposure monitoring |
| **Compliance Administrator** | KYC review, identity checks, suspicious activity, account restrictions |
| **Support Agent** | Limited user info, account support (NO balance access, NO emergency controls) |
| **Auditor** | Read-only: audit logs, reports, transaction history |

### 2.3 Authorization Enforcement
- [ ] Server-side RBAC middleware for every endpoint
- [ ] Supabase Row Level Security (RLS) policies
- [ ] Field-level restrictions per role
- [ ] Frontend button hiding = UX only, NOT security

---

## MODULE 3: Trading Accounts

### 3.1 Account Management
- [ ] `TRADING_ACCOUNTS` table (account_number, account_name, account_type, environment, base_currency, leverage, position_mode, status, ai_enabled, demo/live)
- [ ] `ACCOUNT_SETTINGS` table (one_click_enabled, default_order_size, manual_ai_approval, preferences)
- [ ] Account statuses: `pending`, `active`, `restricted`, `suspended`, `closed`
- [ ] Position modes: `netting`, `hedging`

### 3.2 Multiple Accounts per User
- [ ] Create account (`POST /client/accounts`)
- [ ] List accounts (`GET /client/accounts`)
- [ ] View account details (`GET /client/accounts/{id}`)
- [ ] Update account (`PATCH /client/accounts/{id}`)

### 3.3 Account Switcher
- [ ] Frontend account selector
- [ ] On switch, update: dashboard metrics, positions, orders, transactions, AI settings, risk limits, WebSocket subscriptions
- [ ] Selected account ID in request headers/route context
- [ ] Backend ownership verification on every request

---

## MODULE 4: Market Data

### 4.1 Instruments
- [ ] `INSTRUMENTS` table (symbol, name, asset_class, exchange, quote_currency, contract_size, tick_size, tick_value, status)
- [ ] Asset categories: Forex, Stocks, Indices, Commodities, Crypto, ETFs
- [ ] Symbol search by: code, company name, asset name, category, exchange

### 4.2 Market Quotes
- [ ] `MARKET_QUOTES` table (instrument_id, bid, ask, last, volume, quoted_at)
- [ ] Quote panel display: symbol, bid, ask, spread, daily change, change %, market status, high, low, volume
- [ ] APIs: `GET /market/instruments`, `GET /market/instruments/{symbol}`, `GET /market/quotes`, `GET /market/status`

### 4.3 Candles (OHLC)
- [ ] `CANDLES` table (instrument_id, timeframe, open_time, open, high, low, close, volume)
- [ ] Timeframes: 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w
- [ ] Candle update logic from ticks (update current candle only, don't reload history)
- [ ] API: `GET /market/candles`

### 4.4 Market Data Provider Abstraction
- [ ] `SimulationMarketDataProvider` (for demo mode)
- [ ] `LiveMarketDataProvider` (for live mode)
- [ ] WebSocket tick stream → candle aggregation
- [ ] Market status tracking (open/closed/halted per instrument)

### 4.5 Caching
- [ ] Redis cache for latest quotes
- [ ] Redis cache for recent candles
- [ ] Market-feed staleness detection + alerting

---

## MODULE 5: Web Trader (Charts & Trading Interface)

### 5.1 Symbol Search
- [ ] Search by symbol code, company name, asset name, category, exchange
- [ ] Results with asset class grouping

### 5.2 Quote Panel
- [ ] Symbol, bid, ask, spread, daily change, daily change %, market status, high, low, volume, last update time

### 5.3 Professional Chart
- [ ] Candlestick chart with real OHLC proportions
- [ ] Live candle movement (update current candle only on each tick)
- [ ] Historical candles with lazy loading
- [ ] Horizontal zoom + vertical price zoom
- [ ] Mouse-wheel zoom + drag/pan
- [ ] Crosshair with time/price tooltip
- [ ] Auto-scale + reset chart
- [ ] Full-screen mode + responsive layout
- [ ] Current-price line, bid/ask lines
- [ ] Entry, stop-loss, take-profit lines on chart
- [ ] Open-position markers + executed-order markers

### 5.4 Order Ticket
- [ ] Order types: Market, Limit, Stop, Stop-limit, Stop Loss, Take Profit, Trailing Stop (later)
- [ ] Fields: account, symbol, direction, order type, quantity, entry price, SL, TP, time in force
- [ ] Estimated: margin, commission, spread cost, risk percentage
- [ ] One-click trading (with explicit consent + configurable default quantity)
- [ ] Validations: max position size, available margin, market open

### 5.5 Position Management
- [ ] Close full position / Close partial position
- [ ] Modify stop loss / Modify take profit
- [ ] Cancel pending order
- [ ] Reverse position (optional) / Close all positions (optional)

---

## MODULE 6: Order & Execution Engine

### 6.1 Order State Machine
```
draft → validating → accepted → submitted → partially_filled → filled
                                                    ↓
                                              rejected / canceled / expired / failed
```
- [ ] `ORDERS` table (account_id, instrument_id, ai_signal_id, client_order_id, provider_order_id, source, side, order_type, quantity, requested_price, stop_loss, take_profit, time_in_force, status)
- [ ] `ORDER_EVENTS` table (immutable state change records: previous_status, new_status, reason, provider_payload)

### 6.2 Fills
- [ ] `FILLS` table (order_id, provider_fill_id, quantity, price, commission, filled_at)

### 6.3 Execution Adapter Pattern
```python
class ExecutionAdapter:
    async def place_order(self, order): ...
    async def cancel_order(self, provider_order_id): ...
    async def modify_order(self, provider_order_id, changes): ...
    async def get_order_status(self, provider_order_id): ...
    async def get_positions(self, account_id): ...
```
- [ ] `SimulationExecutionAdapter` (instant fill simulation)
- [ ] `BrokerExecutionAdapter` (real broker API)

### 6.4 Idempotency
- [ ] `Idempotency-Key` header for all financial/trading POST requests
- [ ] `IDEMPOTENCY_KEYS` table (user_id, idempotency_key, request_hash, resource_type, resource_id, expires_at)
- [ ] Same key + same payload → return previous response
- [ ] Same key + different payload → reject
- [ ] Database transaction wrapping for order placement

---

## MODULE 7: Positions & P/L Calculations

### 7.1 Position Management
- [ ] `POSITIONS` table (account_id, instrument_id, side, quantity, average_entry_price, current_price, stop_loss, take_profit, unrealized_pnl, realized_pnl, status, opened_at, closed_at)
- [ ] `POSITION_EVENTS` table (event_type, quantity, price, metadata)

### 7.2 P/L Formulas

**Long Position:**
```
Unrealized P/L = (Current Bid - Entry Price) × Quantity × Contract Multiplier
```

**Short Position:**
```
Unrealized P/L = (Entry Price - Current Ask) × Quantity × Contract Multiplier
```

**Realized P/L:**
```
Realized P/L = Exit Value - Entry Value - Commission - Financing - Other Fees
```

- [ ] Position aggregation: netting model vs hedging model (per account setting)
- [ ] Fees and currency conversion applied separately

### 7.3 Portfolio Snapshots
- [ ] `PORTFOLIO_SNAPSHOTS` table (balance, equity, buying_power, used_margin, free_margin, realized_pnl, unrealized_pnl, captured_at)
- [ ] Capture on: every 1-5 minutes (active accounts), every fill, every deposit/withdrawal, every position close

### 7.4 Daily Account Metrics
- [ ] `DAILY_ACCOUNT_METRICS` table (trades_count, winning_trades, losing_trades, realized_pnl, max_drawdown, commission)

---

## MODULE 8: Dashboard & Portfolio

### 8.1 Portfolio Summary Cards
- [ ] Total balance, Cash, Equity, Buying power, Used margin, Free margin, Margin level %
- [ ] Daily realized P/L, Daily unrealized P/L, Total open positions

### 8.2 Balance Definitions
```
Balance = Closed trades + settled transactions value
Equity = Balance + Unrealized P/L
Free Margin = Equity - Used Margin
Margin Level % = (Equity / Used Margin) × 100
Buying Power = Free Margin × Allowed Leverage (simplified)
```

### 8.3 Portfolio Chart
- [ ] Time ranges: Today, 7 days, 30 days, 90 days, All time
- [ ] Metrics: Equity curve, Balance curve, Realized P/L, Unrealized P/L, Drawdown
- [ ] Powered by portfolio snapshots data

### 8.4 Open Trades Table
- [ ] Columns: Symbol, Direction, Quantity, Entry price, Current price, SL, TP, Unrealized P/L, P/L %, Open time, AI/manual source, Close action
- [ ] Live updates via WebSocket: `market.tick`, `position.updated`, `account.metrics.updated`

### 8.5 Daily Goal Progress
- [ ] Daily profit target + current daily realized P/L + progress %
- [ ] Daily loss limit + remaining loss capacity
- [ ] Trades used / remaining trades
- [ ] Risk statuses: `safe`, `warning`, `near_limit`, `blocked`

---

## MODULE 9: AI Trading Engine

### 9.1 AI Pipeline
```
Market Data → Normalize & Validate → Technical & Market Features
  → Strategy Engine → Signal & Confidence Score → Risk Validation
  → (Rejected → Store Rejection) OR (Approved → Create Order Proposal)
  → Manual Approval (AI Order Board) OR Auto Trading (Submit Order)
  → Execution Adapter → Fill Processing → Position & Ledger Update
  → Performance Analytics
```

### 9.2 AI Data Tables
- [ ] `AI_PROFILES` table (account_id, risk_profile, enabled, auto_trade, minimum_confidence, settings)
- [ ] `AI_STRATEGIES` table (code, name, version, status, configuration)
- [ ] `AI_SESSIONS` table (account_id, status, started_at, stopped_at, stop_reason)
- [ ] `AI_SIGNALS` table (account_id, instrument_id, strategy_id, direction, confidence, entry_price, stop_loss, take_profit, suggested_quantity, status, valid_until)
- [ ] `AI_DECISIONS` table (signal_id, session_id, model_version, input_snapshot, risk_checks, decision, reason)

### 9.3 AI Inputs
- OHLC candles, live ticks, volume, spread, volatility
- Technical indicators, market-session information
- Existing account exposure, open positions, daily P/L
- News sentiment (where licensed), platform risk conditions

### 9.4 AI Output Schema
```json
{
  "symbol": "EURUSD",
  "direction": "BUY",
  "confidence": 0.82,
  "entry_price": 1.0852,
  "stop_loss": 1.0810,
  "take_profit": 1.0930,
  "risk_reward_ratio": 1.86,
  "strategy_id": "trend-following-v2",
  "valid_until": "timestamp",
  "reason_codes": ["trend_alignment", "volume_confirmation", "acceptable_spread"]
}
```

### 9.5 AI Dashboard Cards
- [ ] Symbol, direction (Buy/Sell/Neutral), confidence score, current market price
- [ ] Suggested entry, stop loss, take profit, risk/reward ratio, strategy name
- [ ] Analysis timestamp, expiry timestamp, AI reasoning summary, risk warnings
- [ ] Confidence = calibrated model confidence (NOT guaranteed probability)

### 9.6 AI Order Board
- [ ] Proposed orders: symbol, buy/sell, entry range, current price, SL, TP, position size, expected risk, R:R, confidence, strategy, valid until
- [ ] States: `proposed` → `risk_reviewed` → `approved` / `rejected` / `expired` → `executed`
- [ ] Approve/reject actions (where manual confirmation mode is on)

### 9.7 AI Decision Recording
- [ ] Every AI decision saved (executed OR rejected)
- [ ] Stored: model version, strategy version, input snapshot, confidence, suggested order, risk checks, rejection reason, execution result, final P/L

---

## MODULE 10: Risk Management Engine

### 10.1 Risk Validation Sequence (16 checks in order)
1. Global emergency-stop check
2. User/account status check
3. AI enabled check
4. Market status check
5. Feed freshness check
6. Daily loss check
7. Daily trade-count check
8. Position-count check
9. Position-size check
10. Symbol exposure check
11. Total exposure check
12. Margin check
13. Spread check
14. Volatility check
15. Duplicate-signal check
16. Broker availability check

- [ ] `RISK_EVENTS` table (account_id, order_id, event_type, severity, reason, details)

### 10.2 AI Settings (Client-Configurable)
- [ ] Risk profile: Conservative / Moderate / Aggressive
- [ ] Maximum daily trades
- [ ] Maximum open positions
- [ ] Maximum position size + position size %
- [ ] Daily loss limit
- [ ] Daily profit target
- [ ] Allowed instruments
- [ ] Allowed trading sessions
- [ ] AI auto-trading enabled/disabled
- [ ] Manual approval required
- [ ] Stop after profit target / Stop after loss limit

### 10.3 Risk Profiles
| Profile | Position Size | Trade Frequency | Daily Loss Limit | Confidence Threshold | Simultaneous Exposure |
|---|---|---|---|---|---|
| Conservative | Smaller | Lower | Tighter | Higher | Lower |
| Moderate | Balanced | Medium | Medium | Medium | Medium |
| Aggressive | Larger | Higher | Higher tolerance | Lower (within limits) | More |

### 10.4 Limit Hierarchy
```
Platform Global Limit → Account-Type Limit → Admin User Override → Client Selected Setting
```
- Client can NEVER set more permissive than admin/global maximum
- Example: Platform max=20, Admin override=10, Client selects=15 → Effective=10

### 10.5 AI Auto-Disable Conditions
- Daily loss limit reached
- Margin below threshold
- Emergency stop active
- Account suspended
- Market feed unavailable
- Broker unavailable
- Repeated order rejection
- Abnormal volatility
- AI session error
- User manually pauses AI

### 10.6 Account Risk Limits
- [ ] `ACCOUNT_RISK_LIMITS` table (risk_profile, max_daily_trades, max_open_positions, max_position_size, daily_loss_limit, daily_profit_target, max_drawdown, allowed_instruments)

---

## MODULE 11: Double-Entry Ledger

### 11.1 Core Principle
> Ledger is the SOURCE OF TRUTH for all financial values. Balance fields are derived, never directly edited.

### 11.2 Ledger Tables
- [ ] `LEDGER_ACCOUNTS` table (trading_account_id, account_code, account_type, currency, status)
- [ ] `LEDGER_JOURNALS` table (reference_type, reference_id, description, status, posted_at, created_by)
- [ ] `LEDGER_ENTRIES` table (journal_id, ledger_account_id, entry_type, amount, currency)

### 11.3 Rules
- Every journal: balanced (total debit = total credit), immutable, linked to reference transaction
- Reversal via NEW journal, never edit/delete posted entries
- Financial tables are NEVER soft-deleted — retained immutable

### 11.4 Example: Deposit Journal
```
Debit:  Platform Cash / Clearing Account
Credit: Client Liability Account
```

### 11.5 Example: Withdrawal Journal
```
Debit:  Client Liability Account
Credit: Platform Cash / Clearing Account
```

### 11.6 Admin Adjustments
- [ ] `ADMIN_ADJUSTMENTS` table (account_id, journal_id, amount, adjustment_type, reason, created_by, approved_by, status)
- [ ] Adjustment types: credit correction, debit correction, promotional credit, fee reversal, trade correction, refund, manual settlement
- [ ] Maker-checker approval for large adjustments (Finance Admin creates → Second admin approves → Ledger posts)

---

## MODULE 12: Deposits & Withdrawals

### 12.1 Payment Methods
- [ ] `PAYMENT_METHODS` table (user_id, type, provider, masked_identifier, verified, provider_metadata)
- [ ] Types: bank transfer, credit/debit card, crypto
- [ ] Payment Provider Abstraction: `ManualBankTransferProvider`, `CardPaymentProvider`, `CryptoPaymentProvider`

### 12.2 Deposits
- [ ] `DEPOSITS` table (account_id, payment_method_id, amount, currency, fee, net_amount, provider_reference, status)
- [ ] Statuses: `created` → `awaiting_payment` → `processing` → `pending_review` → `completed` / `failed` / `canceled` / `refunded`

**Deposit Flow:**
1. Client selects method
2. Backend creates deposit intent
3. Payment provider session created
4. Provider webhook received
5. Webhook signature verified
6. Duplicate webhook idempotently ignored (external_event_id)
7. Ledger journal created (debit + credit)
8. Account balance updated
9. Client gets realtime notification

### 12.3 Withdrawals
- [ ] `WITHDRAWALS` table (account_id, payment_method_id, amount, currency, fee, net_amount, provider_reference, status, reviewed_by, review_reason)
- [ ] Statuses: `requested` → `pending_review` → `approved` → `processing` → `completed` / `rejected` / `canceled` / `failed`

**Withdrawal Validations:**
- Sufficient withdrawable balance
- Open-position margin requirement
- Daily withdrawal limit
- KYC status
- Destination ownership
- Account restrictions
- Duplicate request detection
- Compliance review

**Admin Withdrawal Checks:**
- KYC complete, sufficient balance, destination verified
- Recent deposit source, open margin exposure
- Suspicious pattern, withdrawal velocity, previous failed attempts

### 12.4 Transactions
- [ ] `TRANSACTIONS` table (account_id, deposit_id, withdrawal_id, transaction_type, amount, currency, status, reference)
- [ ] Types: deposit, withdrawal, trade settlement, commission, spread charge, financing/swap, admin adjustment, refund, bonus
- [ ] Filters: account, date, type, status, amount, reference
- [ ] Export: CSV (PDF statement later)

### 12.5 Webhook Handling
- [ ] `WEBHOOK_EVENTS` table (provider, external_event_id, event_type, payload, processing_status, attempt_count, received_at, processed_at)
- [ ] Signature verification on every webhook
- [ ] Duplicate detection via external_event_id
- [ ] Idempotent processing

---

## MODULE 13: Live Traders (Anonymous Leaderboard)

### 13.1 Public Trader Identity
- [ ] `PUBLIC_TRADER_PROFILES` table (account_id, public_trader_code, leaderboard_enabled, public_risk_profile)
- [ ] Anonymous IDs: `TRD-8K21`, `TRD-A94P`, `TRD-X72M`
- [ ] Public profile: trader ID, AI risk profile, win rate, realized profit, daily profit, total trades, avg trade duration, current winning streak, rank

### 13.2 Leaderboard
- [ ] `LEADERBOARD_SNAPSHOTS` table (public_trader_id, period, rank, score, profit, return_percentage, win_rate, drawdown, captured_at)
- [ ] Filters: Today, This week, This month, All time + Conservative, Moderate, Aggressive

### 13.3 Ranking Formula
```
score = weighted_return + consistency_score + win_rate_score - drawdown_penalty - risk_penalty
```
- Profit-only ranking would encourage risky behavior — drawdown and consistency MUST be included

### 13.4 Robot Activity Feed
- [ ] `ROBOT_ACTIVITY_EVENTS` table (public_trader_id, instrument_id, activity_type, direction, public_profit, occurred_at)
- [ ] Example events: "TRD-8K21 AI bot opened BUY EUR/USD", "TRD-X72M closed BTC/USD with +$145.20", "TRD-A94P moved stop loss to break-even"

### 13.5 Privacy Rules
- [ ] Feature is user opt-in
- [ ] Real name, email, account number, balance NEVER exposed
- [ ] Position size optionally masked
- [ ] Large trades delayed display
- [ ] Suspended users removed from leaderboard
- [ ] Test/admin accounts excluded

### 13.6 Realtime WebSocket Events
- `leaderboard.updated`
- `robot_activity.created`
- `trader_rank.changed`

---

## MODULE 14: News Feed

### 14.1 News Integration
- [ ] `NEWS_ITEMS` table (provider, external_id, headline, source_url, sentiment, impact_level, related_symbols, published_at)
- [ ] Licensed feeds only (Reuters, Bloomberg, CNBC via approved APIs)
- [ ] NO unauthorized scraping or republishing of full copyrighted articles

### 14.2 News Display
- [ ] Headline, Provider, Published time, Related symbols, Sentiment, Impact level, Source link
- [ ] APIs: `GET /news`, `GET /news/{news_id}`

---

## MODULE 15: Notification System

### 15.1 Notifications
- [ ] `NOTIFICATIONS` table (user_id, type, title, message, payload, read, created_at)
- [ ] Types: trade executed, deposit completed, withdrawal status, AI signal, margin warning, daily limit, security alerts
- [ ] Channels: Email, SMS, Push (via provider abstraction)
- [ ] Real-time notification delivery via WebSocket

---

## MODULE 16: Admin Console

### 16.1 Admin Authentication
- [ ] Secure admin login (separate from client)
- [ ] Mandatory 2FA for all admin roles
- [ ] Session expiration (shorter than client)
- [ ] IP and login audit
- [ ] Sensitive action re-authentication

### 16.2 User Management
- [ ] User directory with columns: user, email, client ID, country, KYC status, account status, trading accounts, total balance, total equity, AI status, registration date, last login
- [ ] Filters: active, pending, restricted, suspended, KYC pending, AI enabled, high-risk
- [ ] User detail tabs: profile, KYC, trading accounts, positions, orders, transactions, AI settings, risk limits, login sessions, admin notes, audit activity
- [ ] Admin actions (all with required reason + identity + previous/new value + timestamp):
  - Create user, Update profile, Verify email, Activate, Restrict, Suspend, Reactivate, Close account, Enable AI, Disable AI, Reset security sessions, Add internal note

### 16.3 Balance Control
- [ ] Balance changes ONLY via ledger adjustment (never direct overwrite)
- [ ] Required fields: user, trading account, amount, currency, adjustment type, reason, supporting evidence, approval reference
- [ ] Maker-checker for large adjustments

### 16.4 Platform Metrics
- [ ] Total AUM, total client balance, total client equity
- [ ] Total open exposure, used margin, free margin
- [ ] Pending deposits, pending withdrawals
- [ ] Daily deposits, daily withdrawals, daily realized P/L
- [ ] Platform commission revenue

### 16.5 Transaction Oversight
- [ ] View all transactions with full filtering
- [ ] View ledger entries + webhook history
- [ ] Export reports
- [ ] Transaction detail: ID, external reference, user, account, amount, currency, fee, net amount, method, provider, status history, ledger journal, risk flags, admin notes

### 16.6 AI Control Panel
- [ ] Global AI parameters: enabled, min confidence, max daily trades, max position size, max platform/symbol/user exposure, default SL/TP, max drawdown, max open positions, allowed instruments, allowed sessions
- [ ] Per-user overrides: AI enable/disable, risk profile, position-size cap, daily trade cap, loss limit, profit target, instrument/strategy restrictions
- [ ] AI monitoring dashboard: active sessions, orders proposed/approved/rejected/executed, daily win rate, realized AI P/L, AI drawdown, provider errors, strategy performance, confidence distribution

### 16.7 Emergency Stop (4 Levels)
1. **Pause New AI Trades** — New AI signals stop, existing positions remain, pending orders canceled based on config
2. **Cancel Pending AI Orders** — All pending AI-generated orders canceled
3. **Close AI Positions** — All existing AI positions market-closed (HIGH IMPACT, two-person approval recommended)
4. **Global Trading Halt** — Both manual AND AI trading halted, only risk-reducing close actions allowed

- [ ] `EMERGENCY_CONTROLS` table (scope, action, status, reason, triggered_by, triggered_at, cleared_at, cleared_by)
- [ ] Every emergency event records: admin, reason, scope, timestamp, affected accounts, result, failed actions

### 16.8 Platform Settings
- [ ] `PLATFORM_SETTINGS` table (category, setting_key, setting_value, version, active, updated_by, updated_at)
- [ ] Categories: Trading, Deposits, Withdrawals, Fees, Risk, Application
- [ ] All settings versioned with change history
- [ ] `USER_OVERRIDES` table for per-account settings (override_type, override_value, reason, created_by, expires_at)

---

## MODULE 17: Audit Logging & Observability

### 17.1 Audit Logs
- [ ] `AUDIT_LOGS` table (actor_user_id, actor_role, action, resource_type, resource_id, previous_value, new_value, ip_address, created_at)
- [ ] Immutable — clients and normal admins cannot edit/delete
- [ ] Events: login/logout, failed admin login, user status changes, role changes, KYC decisions, AI settings changes, risk-limit changes, balance adjustments, withdrawal decisions, emergency actions, platform-settings changes, sensitive data access

### 17.2 Observability
- [ ] Structured JSON logs (request ID, user ID, account ID, service, event, duration, status, error code)
- [ ] Metrics: API latency, API error rate, active WebSockets, market-feed delay, order execution latency, rejected orders, broker failures, AI signal count, risk rejections, ledger posting failures, payment webhook failures

### 17.3 Alerts (Immediate)
- Market feed stale, Broker unavailable, Ledger imbalance
- Payment webhook failures, Abnormal withdrawal volume
- AI error spike, Database connection failure, Emergency stop triggered

---

## MODULE 18: News & Live Feed Integration (External)

### 18.1 News Provider Integration
- [ ] Licensed news feed adapters
- [ ] Sentiment analysis on headlines
- [ ] Symbol mapping from news to instruments

---

## MODULE 19: Production Hardening

### 19.1 Production Launch Gates (ALL must pass before live money)
- [ ] Client authorization fully enforced
- [ ] Supabase RLS reviewed
- [ ] Rate limits active
- [ ] CORS restricted
- [ ] Secrets rotated
- [ ] Admin 2FA active
- [ ] Double-entry ledger verified
- [ ] Deposit webhook signatures verified
- [ ] Withdrawal approval workflow complete
- [ ] Idempotency tests passed
- [ ] Broker reconciliation complete
- [ ] Market-feed failover defined
- [ ] Emergency stop tested
- [ ] Backups and recovery tested
- [ ] Audit logs immutable
- [ ] KYC/AML workflow integrated
- [ ] Legal and regulatory approvals confirmed

### 19.2 Non-Functional Requirements
- **Performance:** API < 500ms (normal load), trading commands minimum latency, server-side pagination
- **Reliability:** No duplicate financial transactions, no duplicate orders from retries, reconnectable WebSockets, provider outage handling, dead-letter queue
- **Scalability:** Stateless API instances, shared Redis, event-driven realtime, indexed queries, time-series partitioning, archived historical candles
- **Accessibility:** Keyboard navigation, high contrast, P/L NOT represented by color only, responsive desktop/tablet/mobile

### 19.3 Security Hardening
- [ ] API rate limiting per endpoint
- [ ] CORS allowlist
- [ ] SQL injection prevention (parameterized queries)
- [ ] Signed webhooks verification
- [ ] Replay-attack protection
- [ ] Payment data tokenization
- [ ] KYC documents in private storage buckets with signed URLs
- [ ] Secret rotation policy
- [ ] Separate dev/staging/prod secrets
- [ ] Restricted production DB access
- [ ] Automated backups with point-in-time recovery

---

## MODULE 20: Broker & Payment Integrations (Live Mode)

### 20.1 Broker Integration
- [ ] Real `BrokerExecutionAdapter` implementation
- [ ] Real `LiveMarketDataProvider` implementation
- [ ] Broker reconciliation
- [ ] Order routing with failover

### 20.2 Payment Integration
- [ ] Real payment gateway integration
- [ ] Real bank transfer processing
- [ ] Real crypto payment processing
- [ ] Settlement reconciliation

---

## WebSocket Event Reference

### Market Events
`market.tick`, `market.quote.updated`, `market.candle.updated`, `market.status.changed`

### Trading Events
`order.created`, `order.accepted`, `order.submitted`, `order.partially_filled`, `order.filled`, `order.rejected`, `order.canceled`, `position.opened`, `position.updated`, `position.closed`

### Account Events
`account.balance.updated`, `account.metrics.updated`, `account.margin.warning`, `account.daily_limit.updated`

### AI Events
`ai.session.started`, `ai.session.paused`, `ai.signal.created`, `ai.signal.expired`, `ai.order.proposed`, `ai.order.rejected_by_risk`

### Finance Events
`deposit.updated`, `withdrawal.updated`, `transaction.created`

### Live Traders Events
`leaderboard.updated`, `robot_activity.created`, `trader_rank.changed`

### Admin Events
`user.status.changed`, `risk.event.created`, `platform.emergency_stop`, `platform.settings.updated`

### Event Envelope
```json
{
  "event_id": "uuid",
  "event_type": "position.updated",
  "account_id": "uuid",
  "sequence": 17281,
  "occurred_at": "timestamp",
  "data": {}
}
```

---

## API Structure Reference

Base URL: `/api/v1`
WebSocket: `/ws/v1`

### Auth
`POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/verify-email`, `GET /auth/sessions`, `DELETE /auth/sessions/{id}`

### Client Profile
`GET /client/profile`, `PATCH /client/profile`, `GET /client/kyc`, `POST /client/kyc`, `POST /client/kyc/documents`

### Trading Accounts
`GET /client/accounts`, `POST /client/accounts`, `GET /client/accounts/{id}`, `PATCH /client/accounts/{id}`, `GET /client/accounts/{id}/metrics`

### Dashboard
`GET /client/accounts/{id}/dashboard`, `GET /client/accounts/{id}/portfolio-history`, `GET /client/accounts/{id}/daily-metrics`, `GET /client/accounts/{id}/risk-summary`

### Market Data
`GET /market/instruments`, `GET /market/instruments/{symbol}`, `GET /market/quotes`, `GET /market/candles`, `GET /market/status`

### Orders
`POST /client/accounts/{id}/orders`, `GET /client/accounts/{id}/orders`, `GET /client/accounts/{id}/orders/{oid}`, `POST /client/accounts/{id}/orders/{oid}/cancel`, `PATCH /client/accounts/{id}/orders/{oid}`

### Positions
`GET /client/accounts/{id}/positions`, `GET /client/accounts/{id}/positions/{pid}`, `POST /client/accounts/{id}/positions/{pid}/close`, `POST /client/accounts/{id}/positions/{pid}/partial-close`, `PATCH /client/accounts/{id}/positions/{pid}/protection`

### AI
`GET /client/accounts/{id}/ai/settings`, `PATCH /client/accounts/{id}/ai/settings`, `POST /client/accounts/{id}/ai/start`, `POST /client/accounts/{id}/ai/pause`, `GET /client/accounts/{id}/ai/signals`, `POST /client/accounts/{id}/ai/signals/{sid}/approve`, `POST /client/accounts/{id}/ai/signals/{sid}/reject`

### Deposits & Withdrawals
`GET /client/payment-methods`, `POST /client/payment-methods`, `POST /client/accounts/{id}/deposits`, `GET /client/accounts/{id}/deposits`, `POST /client/accounts/{id}/withdrawals`, `GET /client/accounts/{id}/withdrawals`, `GET /client/accounts/{id}/transactions`

### Live Traders
`GET /live-traders/leaderboard`, `GET /live-traders/activity`, `PATCH /client/accounts/{id}/leaderboard-preferences`

### News
`GET /news`, `GET /news/{id}`

### Admin Users
`GET /admin/users`, `POST /admin/users`, `GET /admin/users/{id}`, `PATCH /admin/users/{id}`, `POST /admin/users/{id}/activate`, `POST /admin/users/{id}/suspend`, `POST /admin/users/{id}/restrict`, `POST /admin/users/{id}/ai/enable`, `POST /admin/users/{id}/ai/disable`

### Admin Finance
`GET /admin/finance/overview`, `GET /admin/transactions`, `GET /admin/deposits`, `GET /admin/withdrawals`, `POST /admin/withdrawals/{id}/approve`, `POST /admin/withdrawals/{id}/reject`, `POST /admin/accounts/{id}/adjustments`, `GET /admin/ledger/journals`

### Admin AI & Risk
`GET /admin/ai/overview`, `GET /admin/ai/sessions`, `PATCH /admin/ai/global-settings`, `PATCH /admin/ai/users/{id}/override`, `POST /admin/risk/emergency-stop`, `POST /admin/risk/emergency-clear`, `GET /admin/risk/events`, `GET /admin/risk/exposure`

### Platform Settings
`GET /admin/platform/settings`, `PATCH /admin/platform/settings`, `GET /admin/platform/settings/history`

### Audit & Reports
`GET /admin/audit-logs`, `GET /admin/reports`, `POST /admin/reports/export`, `GET /admin/reports/exports/{id}`

---

## Recommended Implementation Order

```
 1. MODULE 0  — Project Setup & Foundation
 2. MODULE 1  — Authentication & User Foundation
 3. MODULE 2  — Roles & Access Control (RBAC)
 4. MODULE 3  — Trading Accounts
 5. MODULE 4  — Market Data
 6. MODULE 5  — Web Trader (Charts & Trading UI)
 7. MODULE 6  — Order & Execution Engine
 8. MODULE 7  — Positions & P/L Calculations
 9. MODULE 8  — Dashboard & Portfolio
10. MODULE 11 — Double-Entry Ledger
11. MODULE 12 — Deposits & Withdrawals
12. MODULE 9  — AI Trading Engine
13. MODULE 10 — Risk Management Engine
14. MODULE 13 — Live Traders (Leaderboard)
15. MODULE 14 — News Feed
16. MODULE 15 — Notification System
17. MODULE 16 — Admin Console
18. MODULE 17 — Audit Logging & Observability
19. MODULE 19 — Production Hardening
20. MODULE 20 — Broker & Payment Live Integrations
```

> ⚠️ AI trading ko order engine aur risk engine se pehle build nahi karna.
> ⚠️ Live-money integrations ko double-entry ledger, audit trail aur idempotency complete hone se pehle enable nahi karna.

---

## Testing Strategy

### Unit Tests (Pure Logic)
P/L calculations, margin calculations, risk limits, position aggregation, fee calculations, ledger balancing, AI limit hierarchy, order state transitions

### Integration Tests (Service Interactions)
Market tick → candle update, Order → fill → position, Fill → P/L update, Deposit webhook → ledger, Withdrawal approval → payout, AI signal → order, Emergency stop → order rejection

### End-to-End Tests (Full Flows)
**Client:** Registration → Account creation → Deposit → Place trade → Modify trade → Close trade → AI settings → Withdrawal
**Admin:** User suspension → Balance adjustment → Withdrawal approval → AI override → Emergency stop → CSV export

### Financial Integrity Tests
After every test: **Total debits = Total credits** ✓

### Failure Tests
Market provider disconnected, Broker timeout, Duplicate webhook, Duplicate order request, Payment callback out of order, Database temporary failure, WebSocket reconnect, Emergency stop during order submission

---

## Definition of Done (per feature)

- [ ] Frontend implemented
- [ ] Backend API implemented
- [ ] Database migration available
- [ ] Authorization applied
- [ ] Validation complete
- [ ] Audit logs added
- [ ] Error states designed
- [ ] Loading and empty states
- [ ] Mobile responsive
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Documentation updated
- [ ] Staging acceptance criteria pass

---

## Central Principles

> **Market Data** drives prices
> **Orders** drive fills
> **Fills** drive positions
> **Positions** drive P/L
> **Ledger** drives financial balances
> **Risk Engine** controls every trade
> **Audit Logs** record every sensitive action
