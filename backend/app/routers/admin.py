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


# ===========================================================================
# KYC REVIEW (Compliance Admin + Super Admin)
# ===========================================================================

@router.get("/kyc")
async def list_kyc_reviews(
    status: str = Query(None),
    db: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_role("super_admin", "compliance_admin")),
):
    """List KYC profiles for review."""
    query = db.table("kyc_profiles").select("*")
    if status:
        query = query.eq("status", status)
    else:
        query = query.in_("status", ["pending", "under_review"])
    result = query.order("submitted_at", desc=True).execute()

    from app.config import settings
    import httpx
    kyc_list = []
    for row in (result.data or []):
        un, uc = "", ""
        try:
            headers = {"apikey": settings.SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}"}
            url = f"{settings.SUPABASE_URL}/rest/v1/user_profiles?select=full_name,client_code&id=eq.{row['user_id']}"
            resp = httpx.get(url, headers=headers, timeout=5)
            if resp.status_code == 200 and resp.json():
                un = resp.json()[0].get("full_name", "")
                uc = resp.json()[0].get("client_code", "")
        except: pass
        kyc_list.append({"id": row["id"], "user_id": row["user_id"], "status": row["status"],
                         "risk_level": row.get("risk_level", "medium"), "submitted_at": row.get("submitted_at"),
                         "full_name": un, "client_code": uc})
    return kyc_list


@router.get("/kyc/{kyc_id}")
async def get_kyc_detail(
    kyc_id: str,
    db: Client = Depends(get_supabase_db),
    auth_client: Client = Depends(get_supabase_auth),
    admin_id: str = Depends(require_role("super_admin", "compliance_admin")),
):
    """Get KYC detail with user info and documents."""
    from app.config import settings
    import httpx
    kyc = db.table("kyc_profiles").select("*").eq("id", kyc_id).single().execute()
    if not kyc.data:
        raise HTTPException(status_code=404, detail="KYC not found")

    # Get user info via direct REST API
    user_info = {}
    try:
        headers = {"apikey": settings.SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}"}
        url = f"{settings.SUPABASE_URL}/rest/v1/user_profiles?select=full_name,client_code,email,phone,country,auth_user_id&id=eq.{kyc.data['user_id']}"
        resp = httpx.get(url, headers=headers, timeout=5)
        if resp.status_code == 200 and resp.json():
            user_info = resp.json()[0]
            if not user_info.get("email") and user_info.get("auth_user_id"):
                try:
                    au = auth_client.auth.admin.get_user_by_id(user_info["auth_user_id"])
                    if au and au.user: user_info["email"] = au.user.email or ""
                except: pass
    except Exception:
        pass

    # Documents with public URLs
    docs = db.table("kyc_documents").select("*").eq("kyc_profile_id", kyc_id).execute()
    docs_list = []
    for d in (docs.data or []):
        docs_list.append({**d, "preview_url": f"{settings.SUPABASE_URL}/storage/v1/object/public/kyc-documents/{d['storage_path']}"})

    return {"kyc": {**kyc.data, "user_profiles": user_info}, "documents": docs_list}


@router.post("/kyc/{kyc_id}/approve")
async def approve_kyc(
    kyc_id: str,
    body: dict,
    db: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_role("super_admin", "compliance_admin")),
):
    """Approve KYC."""
    kyc = db.table("kyc_profiles").select("user_id").eq("id", kyc_id).single().execute()
    if not kyc.data: raise HTTPException(status_code=404, detail="KYC not found")
    db.table("kyc_profiles").update({"status": "approved", "reviewed_at": "now()", "reviewed_by": admin_id}).eq("id", kyc_id).execute()
    db.table("user_profiles").update({"kyc_status": "approved"}).eq("id", kyc.data["user_id"]).execute()
    return {"message": "Approved"}


@router.post("/kyc/{kyc_id}/reject")
async def reject_kyc(
    kyc_id: str,
    body: dict,
    db: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_role("super_admin", "compliance_admin")),
):
    """Reject KYC."""
    reason = body.get("reason", "").strip()
    if not reason: raise HTTPException(status_code=400, detail="Rejection reason required")
    kyc = db.table("kyc_profiles").select("user_id").eq("id", kyc_id).single().execute()
    if not kyc.data: raise HTTPException(status_code=404, detail="KYC not found")
    db.table("kyc_profiles").update({"status": "rejected", "reviewed_at": "now()", "reviewed_by": admin_id, "rejection_reason": reason}).eq("id", kyc_id).execute()
    db.table("user_profiles").update({"kyc_status": "rejected"}).eq("id", kyc.data["user_id"]).execute()
    return {"message": "Rejected"}
