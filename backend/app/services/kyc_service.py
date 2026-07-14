"""
TradeScope AI — KYC Service
"""
from supabase import Client


async def get_kyc_status(db: Client, user_id: str) -> dict:
    """Get KYC profile status for a user."""
    result = (
        db.table("kyc_profiles")
        .select("*")
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    return result.data if result.data else {}


async def submit_kyc(
    db: Client,
    user_id: str,
    documents: list[dict] = None,
) -> dict:
    """
    Submit or update KYC profile.
    Creates KYC profile if it doesn't exist.
    """
    existing = (
        db.table("kyc_profiles")
        .select("id, status")
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if existing.data:
        # Update existing KYC profile
        kyc_id = existing.data["id"]
        db.table("kyc_profiles").update({
            "status": "pending",
            "submitted_at": "now()",
        }).eq("id", kyc_id).execute()
    else:
        # Create new KYC profile
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

    # Update user_profiles KYC status
    db.table("user_profiles").update({
        "kyc_status": "pending",
    }).eq("id", user_id).execute()

    return {"kyc_profile_id": kyc_id, "status": "pending"}


async def upload_kyc_document(
    db: Client,
    user_id: str,
    document_type: str,
    storage_path: str,
) -> dict:
    """Record a KYC document upload."""
    # Get KYC profile
    kyc = (
        db.table("kyc_profiles")
        .select("id")
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not kyc.data:
        raise ValueError("KYC profile not found. Submit KYC first.")

    result = (
        db.table("kyc_documents")
        .insert({
            "kyc_profile_id": kyc.data["id"],
            "document_type": document_type,
            "storage_path": storage_path,
            "status": "uploaded",
        })
        .execute()
    )
    return result.data[0] if result.data else {}


async def list_kyc_documents(db: Client, user_id: str) -> list[dict]:
    """List all KYC documents for a user."""
    kyc = (
        db.table("kyc_profiles")
        .select("id")
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not kyc.data:
        return []

    result = (
        db.table("kyc_documents")
        .select("*")
        .eq("kyc_profile_id", kyc.data["id"])
        .execute()
    )
    return result.data or []
