"""
TradeScope AI — Trading Accounts Router
Endpoints: /api/v1/client/accounts/*
"""
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.dependencies import get_supabase_db, get_profile_id
from app.services import account_service

router = APIRouter(prefix="/client/accounts", tags=["Trading Accounts"])


def _check_owner(db: Client, account_id: str, user_id: str):
    """Verify account ownership, raise 404 if not found."""
    r = (
        db.table("trading_accounts")
        .select("id")
        .eq("id", account_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not r.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")


# ---------------------------------------------------------------------------
# GET /client/accounts
# ---------------------------------------------------------------------------
@router.get("")
async def list_accounts(
    user_id: str = Depends(get_profile_id),
    db: Client = Depends(get_supabase_db),
):
    """List all trading accounts for the current user."""
    return await account_service.list_accounts(db, user_id)


# ---------------------------------------------------------------------------
# POST /client/accounts
# ---------------------------------------------------------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
async def create_account(
    body: dict,
    user_id: str = Depends(get_profile_id),
    db: Client = Depends(get_supabase_db),
):
    """Create a new trading account."""
    try:
        return await account_service.create_account(
            db,
            user_id,
            account_name=body.get("account_name", "My Account"),
            account_type=body.get("account_type", "individual"),
            environment=body.get("environment", "demo"),
            base_currency=body.get("base_currency", "USD"),
            leverage=body.get("leverage", 100),
            position_mode=body.get("position_mode", "netting"),
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ---------------------------------------------------------------------------
# GET /client/accounts/{account_id}
# ---------------------------------------------------------------------------
@router.get("/{account_id}")
async def get_account(
    account_id: str,
    user_id: str = Depends(get_profile_id),
    db: Client = Depends(get_supabase_db),
):
    """Get account detail with settings and risk limits."""
    try:
        return await account_service.get_account(db, account_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ---------------------------------------------------------------------------
# PATCH /client/accounts/{account_id}
# ---------------------------------------------------------------------------
@router.patch("/{account_id}")
async def update_account(
    account_id: str,
    body: dict,
    user_id: str = Depends(get_profile_id),
    db: Client = Depends(get_supabase_db),
):
    """Update account name, leverage, position mode, or status."""
    try:
        return await account_service.update_account(db, account_id, user_id, body)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ---------------------------------------------------------------------------
# GET /client/accounts/{account_id}/metrics
# ---------------------------------------------------------------------------
@router.get("/{account_id}/metrics")
async def get_account_metrics(
    account_id: str,
    user_id: str = Depends(get_profile_id),
    db: Client = Depends(get_supabase_db),
):
    """Get account metrics (balance, equity, P/L, etc.)."""
    try:
        return await account_service.get_account_metrics(db, account_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ---------------------------------------------------------------------------
# PATCH /client/accounts/{account_id}/settings
# ---------------------------------------------------------------------------
@router.patch("/{account_id}/settings")
async def update_account_settings(
    account_id: str,
    body: dict,
    user_id: str = Depends(get_profile_id),
    db: Client = Depends(get_supabase_db),
):
    """Update account settings (one-click, default size, AI approval)."""
    try:
        return await account_service.update_account_settings(db, account_id, user_id, body)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
