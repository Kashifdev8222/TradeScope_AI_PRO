"""
TradeScope AI — Client Router
Endpoints: /api/v1/client/*
"""
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.dependencies import get_supabase_auth, get_supabase_db, get_current_user_id
from app.schemas.auth import UserProfileResponse
from app.services import auth_service

router = APIRouter(prefix="/client", tags=["Client"])


# ---------------------------------------------------------------------------
# GET /client/profile
# ---------------------------------------------------------------------------
@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    auth_user_id: str = Depends(get_current_user_id),
    auth_client: Client = Depends(get_supabase_auth),
    db_client: Client = Depends(get_supabase_db),
):
    """Get the current user's profile."""
    profile = await auth_service.get_profile(db_client, auth_user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    email = ""
    try:
        user = auth_client.auth.admin.get_user_by_id(auth_user_id)
        if user and user.user:
            email = user.user.email or ""
    except Exception:
        pass

    return {
        "id": profile.get("id", ""),
        "client_code": profile.get("client_code", ""),
        "full_name": profile.get("full_name", ""),
        "email": email,
        "phone": profile.get("phone"),
        "country": profile.get("country"),
        "base_currency": profile.get("base_currency", "USD"),
        "timezone": profile.get("timezone", "UTC"),
        "status": profile.get("status", ""),
        "kyc_status": profile.get("kyc_status", ""),
        "risk_disclosure_version": profile.get("risk_disclosure_version"),
        "terms_version": profile.get("terms_version"),
        "created_at": profile.get("created_at"),
        "updated_at": profile.get("updated_at"),
    }


# ---------------------------------------------------------------------------
# PATCH /client/profile
# ---------------------------------------------------------------------------
@router.patch("/profile", response_model=UserProfileResponse)
async def update_profile(
    body: dict,
    auth_user_id: str = Depends(get_current_user_id),
    auth_client: Client = Depends(get_supabase_auth),
    db_client: Client = Depends(get_supabase_db),
):
    """Update the current user's profile."""
    try:
        profile = await auth_service.update_profile(db_client, auth_user_id, body)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    email = ""
    try:
        user = auth_client.auth.admin.get_user_by_id(auth_user_id)
        if user and user.user:
            email = user.user.email or ""
    except Exception:
        pass

    return {
        "id": profile.get("id", ""),
        "client_code": profile.get("client_code", ""),
        "full_name": profile.get("full_name", ""),
        "email": email,
        "phone": profile.get("phone"),
        "country": profile.get("country"),
        "base_currency": profile.get("base_currency", "USD"),
        "timezone": profile.get("timezone", "UTC"),
        "status": profile.get("status", ""),
        "kyc_status": profile.get("kyc_status", ""),
        "risk_disclosure_version": profile.get("risk_disclosure_version"),
        "terms_version": profile.get("terms_version"),
        "created_at": profile.get("created_at"),
        "updated_at": profile.get("updated_at"),
    }
