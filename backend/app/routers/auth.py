"""
TradeScope AI — Auth Router
Endpoints: /api/v1/auth/*
"""
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.dependencies import (
    get_supabase_auth,
    get_supabase_db,
    get_current_user_id,
)
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    RefreshRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    AuthResponse,
    LogoutResponse,
    MessageResponse,
    SessionInfo,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


# Helper to build user response from profile dict + email
def _build_user_response(profile: dict, email: str) -> dict:
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
# POST /auth/register
# ---------------------------------------------------------------------------
@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    auth_client: Client = Depends(get_supabase_auth),
    db_client: Client = Depends(get_supabase_db),
):
    """Register a new user. Creates auth.users + user_profiles row."""
    try:
        auth_user, profile, tokens = await auth_service.register_user(
            auth_client, db_client, body
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return {
        "user": _build_user_response(profile, body.email),
        "tokens": tokens if tokens else {
            "access_token": "",
            "refresh_token": "",
            "token_type": "bearer",
            "expires_in": 0,
        },
    }


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------
@router.post("/login", response_model=AuthResponse)
async def login(
    body: LoginRequest,
    auth_client: Client = Depends(get_supabase_auth),
    db_client: Client = Depends(get_supabase_db),
):
    """Authenticate a user and return tokens + profile."""
    try:
        auth_user, profile, tokens = await auth_service.login_user(
            auth_client, db_client, body.email, body.password
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    return {
        "user": _build_user_response(profile, body.email),
        "tokens": tokens,
    }


# ---------------------------------------------------------------------------
# POST /auth/logout
# ---------------------------------------------------------------------------
@router.post("/logout", response_model=LogoutResponse)
async def logout(
    auth_client: Client = Depends(get_supabase_auth),
    user_id: str = Depends(get_current_user_id),
):
    """Sign out the current user."""
    await auth_service.logout_user(auth_client)
    return {"message": "Logged out successfully"}


# ---------------------------------------------------------------------------
# POST /auth/refresh
# ---------------------------------------------------------------------------
@router.post("/refresh", response_model=dict)
async def refresh(
    body: RefreshRequest,
    auth_client: Client = Depends(get_supabase_auth),
):
    """Refresh an access token."""
    try:
        access_token, refresh_token, expires_in = await auth_service.refresh_session(
            auth_client, body.refresh_token
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": expires_in,
    }


# ---------------------------------------------------------------------------
# POST /auth/forgot-password
# ---------------------------------------------------------------------------
@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    body: ForgotPasswordRequest,
    auth_client: Client = Depends(get_supabase_auth),
):
    """Send a password reset email."""
    try:
        await auth_service.send_password_reset(auth_client, body.email)
    except Exception:
        pass  # Always return success to prevent email enumeration
    return {"message": "If the email exists, a reset link has been sent."}


# ---------------------------------------------------------------------------
# POST /auth/reset-password
# ---------------------------------------------------------------------------
@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    body: ResetPasswordRequest,
    auth_client: Client = Depends(get_supabase_auth),
):
    """Reset password using a reset token."""
    try:
        auth_client.auth.set_session(body.token, "")
        await auth_service.reset_password(auth_client, body.new_password)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return {"message": "Password reset successfully."}


# ---------------------------------------------------------------------------
# POST /auth/verify-email
# ---------------------------------------------------------------------------
@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    body: VerifyEmailRequest,
    auth_client: Client = Depends(get_supabase_auth),
):
    """Verify email address."""
    try:
        await auth_service.verify_email(auth_client, body.token)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return {"message": "Email verified successfully."}


# ---------------------------------------------------------------------------
# GET /auth/sessions
# ---------------------------------------------------------------------------
@router.get("/sessions", response_model=list[SessionInfo])
async def list_sessions(
    auth_client: Client = Depends(get_supabase_auth),
    user_id: str = Depends(get_current_user_id),
):
    """List active sessions for the current user."""
    try:
        response = auth_client.auth.admin.list_user_sessions(user_id)
        sessions = []
        if response and hasattr(response, "sessions"):
            for s in response.sessions:
                sessions.append({
                    "id": getattr(s, "id", ""),
                    "ip_address": getattr(s, "ip_address", None),
                    "user_agent": getattr(s, "user_agent", None),
                    "created_at": getattr(s, "created_at", None),
                    "last_sign_in_at": getattr(s, "last_sign_in_at", None),
                })
        return sessions
    except Exception:
        return []


# ---------------------------------------------------------------------------
# DELETE /auth/sessions/{session_id}
# ---------------------------------------------------------------------------
@router.delete("/sessions/{session_id}", response_model=MessageResponse)
async def revoke_session(
    session_id: str,
    auth_client: Client = Depends(get_supabase_auth),
    user_id: str = Depends(get_current_user_id),
):
    """Revoke a specific session."""
    try:
        auth_client.auth.admin.sign_out(session_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return {"message": "Session revoked."}
