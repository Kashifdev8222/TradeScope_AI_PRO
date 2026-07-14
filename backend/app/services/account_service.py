"""
TradeScope AI — Trading Account Service
"""
import random
import string
from supabase import Client


def _generate_account_number() -> str:
    """Generate unique account number like 8K21-USD-01"""
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{chars}-USD-{random.randint(10, 99):02d}"


# ---------------------------------------------------------------------------
# Account CRUD
# ---------------------------------------------------------------------------


async def create_account(
    db: Client,
    user_id: str,
    account_name: str,
    account_type: str = "individual",
    environment: str = "demo",
    base_currency: str = "USD",
    leverage: float = 100,
    position_mode: str = "netting",
) -> dict:
    """Create a new trading account for a user."""
    account_number = _generate_account_number()

    result = (
        db.table("trading_accounts")
        .insert({
            "user_id": user_id,
            "account_number": account_number,
            "account_name": account_name,
            "account_type": account_type,
            "environment": environment,
            "base_currency": base_currency,
            "leverage": leverage,
            "position_mode": position_mode,
            "status": "active",
            "ai_enabled": False,
        })
        .execute()
    )

    account = result.data[0] if result.data else {}
    account_id = account.get("id")

    if account_id:
        # Create default account settings
        db.table("account_settings").insert({
            "account_id": account_id,
            "one_click_enabled": False,
            "default_order_size": 0.01,
            "manual_ai_approval": True,
            "preferences": {},
        }).execute()

        # Create default risk limits
        db.table("account_risk_limits").insert({
            "account_id": account_id,
            "risk_profile": "moderate",
            "max_daily_trades": 20,
            "max_open_positions": 5,
            "max_position_size": 1.0,
            "daily_loss_limit": 500,
            "daily_profit_target": 1000,
            "max_drawdown": 20,
            "allowed_instruments": ["*"],
            "allowed_sessions": ["*"],
        }).execute()

    return account


async def list_accounts(db: Client, user_id: str) -> list[dict]:
    """Get all trading accounts for a user."""
    result = (
        db.table("trading_accounts")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


async def get_account(db: Client, account_id: str, user_id: str) -> dict:
    """Get a single trading account with settings and risk limits."""
    account = (
        db.table("trading_accounts")
        .select("*")
        .eq("id", account_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not account.data:
        raise ValueError("Account not found")

    settings = (
        db.table("account_settings")
        .select("*")
        .eq("account_id", account_id)
        .single()
        .execute()
    )

    risk = (
        db.table("account_risk_limits")
        .select("*")
        .eq("account_id", account_id)
        .single()
        .execute()
    )

    return {
        "account": account.data,
        "settings": settings.data if settings.data else {},
        "risk_limits": risk.data if risk.data else {},
    }


async def update_account(
    db: Client, account_id: str, user_id: str, updates: dict
) -> dict:
    """Update trading account fields."""
    allowed = {"account_name", "leverage", "position_mode", "status"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    if not filtered:
        raise ValueError("No updatable fields provided")

    result = (
        db.table("trading_accounts")
        .update(filtered)
        .eq("id", account_id)
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0] if result.data else {}


async def update_account_settings(
    db: Client, account_id: str, user_id: str, updates: dict
) -> dict:
    """Update account settings (one-click, default size, AI approval)."""
    # Verify ownership
    owner = (
        db.table("trading_accounts")
        .select("id")
        .eq("id", account_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not owner.data:
        raise ValueError("Account not found")

    allowed = {"one_click_enabled", "default_order_size", "manual_ai_approval", "preferences"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    if not filtered:
        raise ValueError("No valid settings provided")

    result = (
        db.table("account_settings")
        .update(filtered)
        .eq("account_id", account_id)
        .execute()
    )
    return result.data[0] if result.data else {}


async def get_account_metrics(db: Client, account_id: str, user_id: str) -> dict:
    """Get account metrics for dashboard."""
    # Verify ownership
    owner = (
        db.table("trading_accounts")
        .select("id")
        .eq("id", account_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not owner.data:
        raise ValueError("Account not found")

    # Get latest portfolio snapshot
    snap = (
        db.table("portfolio_snapshots")
        .select("*")
        .eq("account_id", account_id)
        .order("captured_at", desc=True)
        .limit(1)
        .execute()
    )

    # Get today's metrics
    from datetime import date
    today_metrics = (
        db.table("daily_account_metrics")
        .select("*")
        .eq("account_id", account_id)
        .eq("metric_date", str(date.today()))
        .single()
        .execute()
    )

    return {
        "latest_snapshot": snap.data[0] if snap.data else {},
        "today_metrics": today_metrics.data if today_metrics.data else {},
    }
