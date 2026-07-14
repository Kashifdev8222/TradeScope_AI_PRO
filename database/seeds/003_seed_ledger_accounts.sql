-- ============================================================
-- TradeScope AI — Seed: Chart of Accounts (Ledger)
-- ============================================================

-- Platform-level ledger accounts (trading_account_id = NULL)
INSERT INTO ledger_accounts (trading_account_id, account_code, account_name, account_type, currency) VALUES
-- Asset Accounts (platform level)
(NULL, '1001', 'Platform Cash - USD', 'asset', 'USD'),
(NULL, '1002', 'Platform Cash - EUR', 'asset', 'EUR'),
(NULL, '1003', 'Platform Cash - GBP', 'asset', 'GBP'),
(NULL, '1004', 'Platform Cash - JPY', 'asset', 'JPY'),
(NULL, '1010', 'Clearing Account', 'asset', 'USD'),
(NULL, '1020', 'Payment Provider Receivable', 'asset', 'USD'),
(NULL, '1030', 'Broker Deposit Account', 'asset', 'USD'),

-- Liability Accounts
(NULL, '2001', 'Client Deposit Liability - USD', 'liability', 'USD'),
(NULL, '2002', 'Client Deposit Liability - EUR', 'liability', 'EUR'),
(NULL, '2003', 'Client Deposit Liability - GBP', 'liability', 'GBP'),
(NULL, '2004', 'Client Deposit Liability - JPY', 'liability', 'JPY'),
(NULL, '2010', 'Pending Withdrawals - USD', 'liability', 'USD'),
(NULL, '2020', 'Unrealized P/L Liability', 'liability', 'USD'),

-- Revenue Accounts
(NULL, '3001', 'Commission Revenue', 'revenue', 'USD'),
(NULL, '3002', 'Spread Revenue', 'revenue', 'USD'),
(NULL, '3003', 'Financing Revenue', 'revenue', 'USD'),
(NULL, '3004', 'Account Fee Revenue', 'revenue', 'USD'),

-- Expense Accounts
(NULL, '4001', 'Payment Processing Fees', 'expense', 'USD'),
(NULL, '4002', 'Market Data Provider Fees', 'expense', 'USD'),
(NULL, '4003', 'Broker Fees', 'expense', 'USD'),
(NULL, '4004', 'Refund Expense', 'expense', 'USD'),

-- Equity Accounts
(NULL, '5001', 'Retained Earnings', 'equity', 'USD'),
(NULL, '5002', 'P/L Settlement Account', 'equity', 'USD');
