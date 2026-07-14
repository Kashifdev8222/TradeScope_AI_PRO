"""
TradeScope AI — Admin Router
Endpoints: /api/v1/admin/*
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client

from app.dependencies import (
    get_supabase_auth,
    get_supabase_db,
    get_profile_id,
    require_role,
    require_admin,
)
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["Admin"])


# ===========================================================================
# ADMIN USERS
# ===========================================================================

# ---------------------------------------------------------------------------
# GET /admin/users
# ---------------------------------------------------------------------------
@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str = Query(None),
    kyc_status: str = Query(None),
    search: str = Query(None),
    db_client: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_admin()),
):
    """List all users (admin only)."""
    return await admin_service.list_users(
        db_client, page, page_size, status, kyc_status, None, search
    )


# ---------------------------------------------------------------------------
# GET /admin/users/{user_id}
# ---------------------------------------------------------------------------
@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    db_client: Client = Depends(get_supabase_db),
    auth_client: Client = Depends(get_supabase_auth),
    admin_id: str = Depends(require_admin()),
):
    """Get full detail for a user."""
    try:
        return await admin_service.get_user_detail(db_client, auth_client, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ---------------------------------------------------------------------------
# POST /admin/users/{user_id}/activate
# ---------------------------------------------------------------------------
@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: str,
    body: dict,
    db_client: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_role("super_admin", "user_admin")),
):
    """Activate a user account."""
    reason = body.get("reason", "Activated by admin")
    try:
        return await admin_service.update_user_status(
            db_client, user_id, "active", admin_id, reason
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ---------------------------------------------------------------------------
# POST /admin/users/{user_id}/suspend
# ---------------------------------------------------------------------------
@router.post("/users/{user_id}/suspend")
async def suspend_user(
    user_id: str,
    body: dict,
    db_client: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_role("super_admin", "user_admin")),
):
    """Suspend a user account."""
    reason = body.get("reason", "Suspended by admin")
    try:
        return await admin_service.update_user_status(
            db_client, user_id, "suspended", admin_id, reason
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ---------------------------------------------------------------------------
# POST /admin/users/{user_id}/restrict
# ---------------------------------------------------------------------------
@router.post("/users/{user_id}/restrict")
async def restrict_user(
    user_id: str,
    body: dict,
    db_client: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_role("super_admin", "user_admin", "compliance_admin")),
):
    """Restrict a user account."""
    reason = body.get("reason", "Restricted by admin")
    try:
        return await admin_service.update_user_status(
            db_client, user_id, "restricted", admin_id, reason
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ---------------------------------------------------------------------------
# POST /admin/users/{user_id}/close
# ---------------------------------------------------------------------------
@router.post("/users/{user_id}/close")
async def close_user(
    user_id: str,
    body: dict,
    db_client: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_role("super_admin")),
):
    """Close a user account. SUPER ADMIN ONLY."""
    reason = body.get("reason", "Closed by admin")
    try:
        return await admin_service.update_user_status(
            db_client, user_id, "closed", admin_id, reason
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ---------------------------------------------------------------------------
# POST /admin/users/{user_id}/ai/enable
# ---------------------------------------------------------------------------
@router.post("/users/{user_id}/ai/enable")
async def enable_user_ai(
    user_id: str,
    body: dict,
    db_client: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_role("super_admin", "user_admin")),
):
    """Enable AI for all of a user's accounts."""
    reason = body.get("reason", "AI enabled by admin")
    return await admin_service.set_user_ai_enabled(db_client, user_id, True, admin_id, reason)


# ---------------------------------------------------------------------------
# POST /admin/users/{user_id}/ai/disable
# ---------------------------------------------------------------------------
@router.post("/users/{user_id}/ai/disable")
async def disable_user_ai(
    user_id: str,
    body: dict,
    db_client: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_role("super_admin", "user_admin")),
):
    """Disable AI for all of a user's accounts."""
    reason = body.get("reason", "AI disabled by admin")
    return await admin_service.set_user_ai_enabled(db_client, user_id, False, admin_id, reason)


# ---------------------------------------------------------------------------
# POST /admin/users/{user_id}/roles
# ---------------------------------------------------------------------------
@router.post("/users/{user_id}/roles")
async def assign_role_to_user(
    user_id: str,
    body: dict,
    db_client: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_role("super_admin")),
):
    """Assign a role to a user. SUPER ADMIN ONLY."""
    role_code = body.get("role_code", "")
    if not role_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="role_code required")
    try:
        return await admin_service.assign_role(db_client, user_id, role_code, admin_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ===========================================================================
# ADMIN DASHBOARD
# ===========================================================================

# ---------------------------------------------------------------------------
# GET /admin/me
# ---------------------------------------------------------------------------
@router.get("/me")
async def admin_me(
    profile_id: str = Depends(require_admin()),
    db_client: Client = Depends(get_supabase_db),
    auth_client: Client = Depends(get_supabase_auth),
):
    """Get current admin's profile + roles. Only works for admin users."""
    try:
        detail = await admin_service.get_user_detail(db_client, auth_client, profile_id)
        return detail
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin profile not found")
