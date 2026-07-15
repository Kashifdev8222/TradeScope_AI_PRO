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
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else {}
    except Exception:
        return {}


async def submit_kyc(db: Client, user_id: str, auth_client: Client = None) -> dict:
    """Submit KYC for review. Updates existing profile or creates one. Stores user info."""
    # Get user info — try auth_client first (more reliable for user_profiles queries)
    full_name, client_code, email = "", "", ""
    client = auth_client or db
    try:
        up = client.table("user_profiles").select("full_name,client_code,auth_user_id").eq("id", user_id).execute()
        if up.data and len(up.data) > 0:
            full_name = up.data[0].get("full_name", "")
            client_code = up.data[0].get("client_code", "")
    except: pass
    # If still empty, try db client
    if not full_name and client != db:
        try:
            up = db.table("user_profiles").select("full_name,client_code,auth_user_id").eq("id", user_id).execute()
            if up.data and len(up.data) > 0:
                full_name = up.data[0].get("full_name", "")
                client_code = up.data[0].get("client_code", "")
        except: pass

    result = (
        db.table("kyc_profiles")
        .select("id, status")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    if result.data:
        kyc_id = result.data[0]["id"]
        db.table("kyc_profiles").update({
            "status": "pending",
            "submitted_at": "now()",
            "full_name": full_name,
            "client_code": client_code,
            "email": email,
        }).eq("id", kyc_id).execute()
    else:
        new = (
            db.table("kyc_profiles")
            .insert({
                "user_id": user_id,
                "status": "pending",
                "risk_level": "medium",
                "submitted_at": "now()",
                "full_name": full_name,
                "client_code": client_code,
                "email": email,
            })
            .execute()
        )
        kyc_id = new.data[0]["id"] if new.data else None

    db.table("user_profiles").update({
        "kyc_status": "pending",
    }).eq("id", user_id).execute()

    return {"kyc_profile_id": kyc_id, "status": "pending"}


async def upload_kyc_document(db: Client, user_id: str, document_type: str, storage_path: str) -> dict:
    """Record a KYC document upload. Creates KYC profile only if needed, does NOT change status."""
    kyc_id = None
    try:
        kyc = (
            db.table("kyc_profiles")
            .select("id")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if kyc.data:
            kyc_id = kyc.data[0]["id"]
    except Exception:
        pass

    if not kyc_id:
        # Store user info alongside KYC
        full_name, client_code = "", ""
        try:
            up = db.table("user_profiles").select("full_name,client_code").eq("id", user_id).execute()
            if up.data:
                full_name = up.data[0].get("full_name", "")
                client_code = up.data[0].get("client_code", "")
        except: pass
        result = (
            db.table("kyc_profiles")
            .insert({
                "user_id": user_id,
                "status": "not_submitted",
                "risk_level": "medium",
                "full_name": full_name,
                "client_code": client_code,
            })
            .execute()
        )
        kyc_id = result.data[0]["id"] if result.data else None

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
    """List all KYC documents for a user. Uses a direct join query."""
    try:
        result = (
            db.table("kyc_documents")
            .select("*, kyc_profiles!inner(id)")
            .eq("kyc_profiles.user_id", user_id)
            .execute()
        )
        return result.data or []
    except Exception:
        return []
