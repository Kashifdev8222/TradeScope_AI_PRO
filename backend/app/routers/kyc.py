"""
TradeScope AI — KYC Router
Endpoints: /api/v1/client/kyc/*
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from supabase import Client

from app.dependencies import get_supabase_db, get_supabase_auth, get_profile_id
from app.services import kyc_service
from app.config import settings

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
    file: UploadFile = File(...),
    document_type: str = Form(...),
    user_id: str = Depends(get_profile_id),
    db: Client = Depends(get_supabase_db),
    auth_client: Client = Depends(get_supabase_auth),
):
    """Upload a KYC document file to Supabase Storage."""

    valid_types = ["passport", "id_front", "id_back", "drivers_license", "utility_bill", "bank_statement", "national_id", "other"]
    if document_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"document_type must be one of: {', '.join(valid_types)}",
        )

    # Read file content
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large (max 10MB)")

    # Generate unique file path
    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    storage_path = f"kyc/{user_id}/{uuid.uuid4()}.{ext}"

    # Upload to Supabase Storage using admin client
    try:
        auth_client.storage.from_("kyc-documents").upload(
            storage_path,
            contents,
            {"content-type": file.content_type or "application/octet-stream"}
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Upload failed: {str(e)}")

    # Record in database
    try:
        return await kyc_service.upload_kyc_document(db, user_id, document_type, storage_path)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ---------------------------------------------------------------------------
# GET /client/kyc/documents/{doc_id}/url
# ---------------------------------------------------------------------------
@router.get("/documents/{doc_id}/url")
async def get_document_preview_url(
    doc_id: str,
    user_id: str = Depends(get_profile_id),
    db: Client = Depends(get_supabase_db),
    auth_client: Client = Depends(get_supabase_auth),
):
    """Get a temporary signed URL for previewing a KYC document."""
    doc = (
        db.table("kyc_documents")
        .select("id, storage_path, kyc_profiles!inner(user_id)")
        .eq("id", doc_id)
        .eq("kyc_profiles.user_id", user_id)
        .limit(1)
        .execute()
    )
    if not doc.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    try:
        signed = auth_client.storage.from_("kyc-documents").create_signed_url(
            doc.data[0]["storage_path"], 300
        )
        url = signed.get("signedURL", "") if isinstance(signed, dict) else ""
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
