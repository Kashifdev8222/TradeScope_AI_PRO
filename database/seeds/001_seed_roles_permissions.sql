-- ============================================================
-- TradeScope AI — Seed: Roles & Permissions
-- ============================================================

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO roles (code, name, description) VALUES
('super_admin', 'Super Admin', 'Full platform control — all permissions'),
('user_admin', 'User Administrator', 'Create/update users, activate/suspend accounts, enable/disable AI'),
('finance_admin', 'Finance Administrator', 'Review deposits, approve/reject withdrawals, balance adjustments, ledger access'),
('risk_manager', 'Risk Manager', 'User risk limits, global trade limits, emergency stop, margin/exposure monitoring'),
('compliance_admin', 'Compliance Administrator', 'KYC review, identity checks, suspicious activity review, account restrictions'),
('support_agent', 'Support Agent', 'Limited user information, account support — no balance or emergency access'),
('auditor', 'Auditor', 'Read-only: audit logs, reports, transaction history');

-- ============================================================
-- PERMISSIONS (grouped by resource)
-- ============================================================

-- Users
INSERT INTO permissions (code, name, resource, action) VALUES
('users.read', 'View Users', 'users', 'read'),
('users.create', 'Create Users', 'users', 'create'),
('users.update', 'Update Users', 'users', 'update'),
('users.suspend', 'Suspend Users', 'users', 'suspend'),
('users.restrict', 'Restrict Users', 'users', 'restrict'),
('users.close', 'Close Accounts', 'users', 'close'),
('users.verify_email', 'Verify Email', 'users', 'verify_email');

-- KYC
INSERT INTO permissions (code, name, resource, action) VALUES
('kyc.read', 'View KYC', 'kyc', 'read'),
('kyc.review', 'Review KYC', 'kyc', 'review'),
('kyc.approve', 'Approve KYC', 'kyc', 'approve'),
('kyc.reject', 'Reject KYC', 'kyc', 'reject');

-- Trading
INSERT INTO permissions (code, name, resource, action) VALUES
('trading.read', 'View Trading Accounts', 'trading', 'read'),
('trading.manage', 'Manage Trading Accounts', 'trading', 'manage');

-- Finance
INSERT INTO permissions (code, name, resource, action) VALUES
('finance.read', 'View Financial Data', 'finance', 'read'),
('finance.deposits.review', 'Review Deposits', 'finance', 'review_deposits'),
('finance.withdrawals.approve', 'Approve Withdrawals', 'finance', 'approve_withdrawals'),
('finance.withdrawals.reject', 'Reject Withdrawals', 'finance', 'reject_withdrawals'),
('finance.adjustments.create', 'Create Balance Adjustments', 'finance', 'create_adjustments'),
('finance.adjustments.approve', 'Approve Balance Adjustments', 'finance', 'approve_adjustments'),
('finance.ledger.read', 'View Ledger', 'finance', 'read_ledger'),
('finance.export', 'Export Financial Reports', 'finance', 'export');

-- AI
INSERT INTO permissions (code, name, resource, action) VALUES
('ai.read', 'View AI Data', 'ai', 'read'),
('ai.settings.global', 'Manage Global AI Settings', 'ai', 'manage_global'),
('ai.settings.user', 'Manage User AI Overrides', 'ai', 'manage_user'),
('ai.enable', 'Enable AI for Users', 'ai', 'enable'),
('ai.disable', 'Disable AI for Users', 'ai', 'disable'),
('ai.monitor', 'Monitor AI Performance', 'ai', 'monitor');

-- Risk
INSERT INTO permissions (code, name, resource, action) VALUES
('risk.read', 'View Risk Data', 'risk', 'read'),
('risk.limits.user', 'Manage User Risk Limits', 'risk', 'manage_user_limits'),
('risk.limits.global', 'Manage Global Risk Limits', 'risk', 'manage_global_limits'),
('risk.emergency.stop', 'Trigger Emergency Stop', 'risk', 'emergency_stop'),
('risk.emergency.clear', 'Clear Emergency Stop', 'risk', 'emergency_clear'),
('risk.exposure', 'View Exposure Dashboard', 'risk', 'view_exposure');

-- Platform
INSERT INTO permissions (code, name, resource, action) VALUES
('platform.settings.read', 'View Platform Settings', 'platform', 'read_settings'),
('platform.settings.update', 'Update Platform Settings', 'platform', 'update_settings'),
('platform.maintenance', 'Toggle Maintenance Mode', 'platform', 'maintenance');

-- Audit & Reports
INSERT INTO permissions (code, name, resource, action) VALUES
('audit.read', 'View Audit Logs', 'audit', 'read'),
('reports.read', 'View Reports', 'reports', 'read'),
('reports.export', 'Export Reports', 'reports', 'export');

-- Roles (for super admin)
INSERT INTO permissions (code, name, resource, action) VALUES
('roles.read', 'View Roles', 'roles', 'read'),
('roles.assign', 'Assign Roles', 'roles', 'assign');

-- ============================================================
-- ROLE → PERMISSION MAPPING
-- ============================================================

-- Super Admin: ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE code = 'super_admin'), id FROM permissions;

-- User Administrator
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE code = 'user_admin'), id
FROM permissions WHERE code IN (
    'users.read', 'users.create', 'users.update', 'users.suspend',
    'users.restrict', 'users.verify_email',
    'kyc.read',
    'trading.read', 'trading.manage',
    'ai.read', 'ai.enable', 'ai.disable', 'ai.monitor',
    'risk.read',
    'audit.read'
);

-- Finance Administrator
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE code = 'finance_admin'), id
FROM permissions WHERE code IN (
    'users.read',
    'trading.read',
    'finance.read', 'finance.deposits.review',
    'finance.withdrawals.approve', 'finance.withdrawals.reject',
    'finance.adjustments.create',
    'finance.ledger.read', 'finance.export',
    'audit.read', 'reports.read', 'reports.export'
);

-- Risk Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE code = 'risk_manager'), id
FROM permissions WHERE code IN (
    'users.read',
    'trading.read',
    'finance.read',
    'ai.read', 'ai.monitor',
    'risk.read', 'risk.limits.user', 'risk.limits.global',
    'risk.emergency.stop', 'risk.emergency.clear', 'risk.exposure',
    'audit.read'
);

-- Compliance Administrator
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE code = 'compliance_admin'), id
FROM permissions WHERE code IN (
    'users.read', 'users.restrict',
    'kyc.read', 'kyc.review', 'kyc.approve', 'kyc.reject',
    'trading.read',
    'finance.read',
    'audit.read'
);

-- Support Agent
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE code = 'support_agent'), id
FROM permissions WHERE code IN (
    'users.read',
    'kyc.read',
    'trading.read',
    'finance.read'
);

-- Auditor
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE code = 'auditor'), id
FROM permissions WHERE code IN (
    'users.read',
    'trading.read',
    'finance.read', 'finance.ledger.read', 'finance.export',
    'ai.read',
    'risk.read',
    'audit.read', 'reports.read', 'reports.export'
);
