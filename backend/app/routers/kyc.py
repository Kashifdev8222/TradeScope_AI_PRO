"""
TradeScope AI — KYC Router
Endpoints: /api/v1/client/kyc/*
"""
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.dependencies import get_supabase_db, get_profile_id
from app.services import kyc_service

router = APIRouter(prefix="/client/kyc", tags=["KYC"])


# ---------------------------------------------------------------------------
# GET /client/kyc
# ---------------------------------------------------------------------------
@router.get("")
async def get_kyc_status(
    user_id: str = Depends(get_profile_id),
    db: Client = Depends(get_supabase_db),
):
    """Get KYC profile status and documents."""
    kyc = await kyc_service.get_kyc_status(db, user_id)
    docs = await kyc_service.list_kyc_documents(db, user_id)
    return {
        "kyc_profile": kyc,
        "documents": docs,
    }


# ---------------------------------------------------------------------------
# POST /client/kyc
# ---------------------------------------------------------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_kyc(
    user_id: str = Depends(get_profile_id),
    db: Client = Depends(get_supabase_db),
):
    """Submit KYC for review."""
    try:
        return await kyc_service.submit_kyc(db, user_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ---------------------------------------------------------------------------
# POST /client/kyc/documents
# ---------------------------------------------------------------------------
@router.post("/documents", status_code=status.HTTP_201_CREATED)
async def upload_kyc_document(
    body: dict,
    user_id: str = Depends(get_profile_id),
    db: Client = Depends(get_supabase_db),
):
    """
    Record a KYC document upload.
    Expected: {"document_type": "passport", "storage_path": "kyc/user_id/passport.jpg"}
    """
    doc_type = body.get("document_type")
    storage_path = body.get("storage_path")
    if not doc_type or not storage_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="document_type and storage_path required",
        )

    valid_types = ["passport", "drivers_license", "utility_bill", "bank_statement", "national_id", "other"]
    if doc_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"document_type must be one of: {', '.join(valid_types)}",
        )

    try:
        return await kyc_service.upload_kyc_document(db, user_id, doc_type, storage_path)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
