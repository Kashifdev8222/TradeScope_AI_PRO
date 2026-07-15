"""
TradeScope AI — Admin KYC Router
Endpoints: /api/v1/admin/kyc/*
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client

from app.dependencies import get_supabase_db, get_supabase_auth, require_role

router = APIRouter(prefix="/admin/kyc", tags=["Admin KYC"])


# ---------------------------------------------------------------------------
# GET /admin/kyc — List KYC profiles for review
# ---------------------------------------------------------------------------
@router.get("")
async def list_kyc_reviews(
    status: str = Query(None, description="Filter: pending, approved, rejected"),
    db: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_role("super_admin", "compliance_admin")),
):
    """List KYC profiles for review. Compliance Admin + Super Admin only."""
    # Fetch KYC profiles
    query = db.table("kyc_profiles").select("*")
    if status:
        query = query.eq("status", status)
    else:
        query = query.in_("status", ["pending", "under_review"])
    result = query.order("submitted_at", desc=True).execute()

    kyc_list = []
    for row in (result.data or []):
        # Fetch user info separately
        user_name = ""
        user_code = ""
        try:
            user = db.table("user_profiles").select("full_name, client_code").eq("id", row["user_id"]).limit(1).execute()
            if user.data:
                user_name = user.data[0].get("full_name", "")
                user_code = user.data[0].get("client_code", "")
        except Exception:
            pass

        kyc_list.append({
            "id": row["id"],
            "user_id": row["user_id"],
            "status": row["status"],
            "risk_level": row.get("risk_level", "medium"),
            "submitted_at": row.get("submitted_at"),
            "full_name": user_name,
            "client_code": user_code,
        })

    return kyc_list


# ---------------------------------------------------------------------------
# GET /admin/kyc/{kyc_id} — KYC detail with documents
# ---------------------------------------------------------------------------
@router.get("/{kyc_id}")
async def get_kyc_detail(
    kyc_id: str,
    db: Client = Depends(get_supabase_db),
    auth_client: Client = Depends(get_supabase_auth),
    admin_id: str = Depends(require_role("super_admin", "compliance_admin")),
):
    """Get full KYC detail with documents and signed preview URLs."""
    kyc = (
        db.table("kyc_profiles")
        .select("*")
        .eq("id", kyc_id)
        .single()
        .execute()
    )

    if not kyc.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KYC profile not found")

    # Fetch user info separately
    user_info = {}
    try:
        u = db.table("user_profiles").select("full_name, client_code, email, phone, country").eq("id", kyc.data["user_id"]).limit(1).execute()
        if u.data:
            user_info = u.data[0]
    except Exception:
        pass

    kyc.data["user_profiles"] = user_info

    documents = (
        db.table("kyc_documents")
        .select("*")
        .eq("kyc_profile_id", kyc_id)
        .execute()
    )

    docs_with_urls = []
    for doc in (documents.data or []):
        url = ""
        try:
            signed = auth_client.storage.from_("kyc-documents").create_signed_url(
                doc["storage_path"], 600
            )
            url = signed.get("signedURL", "") if isinstance(signed, dict) else ""
        except Exception:
            pass
        docs_with_urls.append({**doc, "preview_url": url})

    return {
        "kyc": kyc.data,
        "documents": docs_with_urls,
    }


# ---------------------------------------------------------------------------
# POST /admin/kyc/{kyc_id}/approve
# ---------------------------------------------------------------------------
@router.post("/{kyc_id}/approve")
async def approve_kyc(
    kyc_id: str,
    body: dict,
    db: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_role("super_admin", "compliance_admin")),
):
    """Approve a KYC profile."""
    reason = body.get("reason", "Approved by admin")

    kyc = db.table("kyc_profiles").select("user_id").eq("id", kyc_id).single().execute()
    if not kyc.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KYC not found")

    db.table("kyc_profiles").update({
        "status": "approved",
        "reviewed_at": "now()",
        "reviewed_by": admin_id,
    }).eq("id", kyc_id).execute()

    db.table("user_profiles").update({
        "kyc_status": "approved",
    }).eq("id", kyc.data["user_id"]).execute()

    # Audit
    db.table("audit_logs").insert({
        "actor_user_id": admin_id,
        "actor_role": "admin",
        "action": "kyc.approved",
        "resource_type": "kyc_profiles",
        "resource_id": kyc_id,
        "reason": reason,
    }).execute()

    return {"message": "KYC approved", "kyc_id": kyc_id}


# ---------------------------------------------------------------------------
# POST /admin/kyc/{kyc_id}/reject
# ---------------------------------------------------------------------------
@router.post("/{kyc_id}/reject")
async def reject_kyc(
    kyc_id: str,
    body: dict,
    db: Client = Depends(get_supabase_db),
    admin_id: str = Depends(require_role("super_admin", "compliance_admin")),
):
    """Reject a KYC profile."""
    reason = body.get("reason", "Rejected by admin")
    if not body.get("reason"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rejection reason is required")

    kyc = db.table("kyc_profiles").select("user_id").eq("id", kyc_id).single().execute()
    if not kyc.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KYC not found")

    db.table("kyc_profiles").update({
        "status": "rejected",
        "reviewed_at": "now()",
        "reviewed_by": admin_id,
        "rejection_reason": reason,
    }).eq("id", kyc_id).execute()

    db.table("user_profiles").update({
        "kyc_status": "rejected",
    }).eq("id", kyc.data["user_id"]).execute()

    db.table("audit_logs").insert({
        "actor_user_id": admin_id,
        "actor_role": "admin",
        "action": "kyc.rejected",
        "resource_type": "kyc_profiles",
        "resource_id": kyc_id,
        "reason": reason,
    }).execute()

    return {"message": "KYC rejected", "kyc_id": kyc_id}
