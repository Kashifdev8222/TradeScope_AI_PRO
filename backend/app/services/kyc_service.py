"""
TradeScope AI — KYC Service
"""
from supabase import Client


async def get_kyc_status(db: Client, user_id: str) -> dict:
    """Get KYC profile status for a user. Returns empty dict if none exists."""
    try:
        result = (
            db.table("kyc_profiles")
            .select("*")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        return result.data if result.data else {}
    except Exception:
        return {}


async def submit_kyc(db: Client, user_id: str) -> dict:
    """Submit or update KYC profile. Creates if doesn't exist."""
    try:
        existing = (
            db.table("kyc_profiles")
            .select("id, status")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
    except Exception:
        existing = type("R", (), {"data": None})()

    if existing.data:
        kyc_id = existing.data["id"]
        db.table("kyc_profiles").update({
            "status": "pending",
            "submitted_at": "now()",
        }).eq("id", kyc_id).execute()
    else:
        result = (
            db.table("kyc_profiles")
            .insert({
                "user_id": user_id,
                "status": "pending",
                "risk_level": "medium",
                "submitted_at": "now()",
            })
            .execute()
        )
        kyc_id = result.data[0]["id"] if result.data else None

    db.table("user_profiles").update({
        "kyc_status": "pending",
    }).eq("id", user_id).execute()

    return {"kyc_profile_id": kyc_id, "status": "pending"}


async def upload_kyc_document(db: Client, user_id: str, document_type: str, storage_path: str) -> dict:
    """Record a KYC document upload. Auto-creates KYC profile if needed."""
    # Auto-create KYC profile if not exists
    kyc_id = None
    try:
        kyc = (
            db.table("kyc_profiles")
            .select("id")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if kyc.data:
            kyc_id = kyc.data["id"]
    except Exception:
        pass

    if not kyc_id:
        result = (
            db.table("kyc_profiles")
            .insert({
                "user_id": user_id,
                "status": "pending",
                "risk_level": "medium",
            })
            .execute()
        )
        kyc_id = result.data[0]["id"] if result.data else None
        # Update user KYC status
        db.table("user_profiles").update({"kyc_status": "pending"}).eq("id", user_id).execute()

    result = (
        db.table("kyc_documents")
        .insert({
            "kyc_profile_id": kyc_id,
            "document_type": document_type,
            "storage_path": storage_path,
            "status": "uploaded",
        })
        .execute()
    )
    return result.data[0] if result.data else {}


async def list_kyc_documents(db: Client, user_id: str) -> list[dict]:
    """List all KYC documents for a user."""
    try:
        kyc = (
            db.table("kyc_profiles")
            .select("id")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
    except Exception:
        return []

    if not kyc.data:
        return []

    result = (
        db.table("kyc_documents")
        .select("*")
        .eq("kyc_profile_id", kyc.data["id"])
        .execute()
    )
    return result.data or []
