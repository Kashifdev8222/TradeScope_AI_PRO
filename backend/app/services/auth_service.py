"""
TradeScope AI — Auth Service
Handles registration, login, and profile management using Supabase Auth.

IMPORTANT: Every function takes TWO clients:
  - auth_client: for Supabase Auth operations (sign_up, sign_in, etc.)
  - db_client:   for DB table operations (insert, select, update)

This separation prevents the DB client's service_role session from being
overwritten by auth calls (sign_up sets the user's session on the client).
"""
import random
import string
from typing import Tuple
from supabase import Client
from app.schemas.auth import RegisterRequest


def _generate_client_code() -> str:
    """Generate a unique client code like CL-8K21."""
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"CL-{suffix}"


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------


async def register_user(
    auth_client: Client, db_client: Client, data: RegisterRequest
) -> Tuple[dict, dict]:
    """
    Register a new user in Supabase Auth AND create their user_profiles row.
    Uses auth_client for sign_up, db_client for table insert (stays on service_role).
    """
    # 1. Create the auth user (uses auth_client — this sets the session on auth_client only)
    auth_response = auth_client.auth.sign_up(
        {
            "email": data.email,
            "password": data.password,
        }
    )

    if auth_response.user is None:
        raise ValueError("Registration failed — no user returned from Supabase Auth")

    auth_user = auth_response.user
    session = auth_response.session  # Will exist if email confirmation is disabled

    # 2. Create the public user_profiles row
    #    Uses db_client — still on service_role, never contaminated by auth
    client_code = _generate_client_code()
    profile_data = {
        "auth_user_id": auth_user.id,
        "client_code": client_code,
        "full_name": data.full_name,
        "phone": data.phone,
        "country": data.country,
        "base_currency": data.base_currency,
        "timezone": data.timezone,
        "status": "active",
        "kyc_status": "not_submitted",
        "terms_version": "1.0",
        "risk_disclosure_version": "1.0",
    }

    result = db_client.table("user_profiles").insert(profile_data).execute()
    profile = result.data[0] if result.data else {}

    # Return tokens if session exists (email confirmation disabled = auto-confirmed)
    tokens = {}
    if session:
        tokens = {
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "expires_in": session.expires_in or 3600,
        }

    return auth_user.model_dump(), profile, tokens


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------


async def login_user(
    auth_client: Client, db_client: Client, email: str, password: str
) -> Tuple[dict, dict, dict]:
    """Authenticate user and return (auth_user_dict, profile_dict, tokens_dict)."""
    auth_response = auth_client.auth.sign_in_with_password(
        {"email": email, "password": password}
    )

    if auth_response.user is None:
        raise ValueError("Invalid credentials")

    auth_user = auth_response.user
    session = auth_response.session

    # Fetch the matching user_profiles row (uses db_client — clean)
    result = (
        db_client.table("user_profiles")
        .select("*")
        .eq("auth_user_id", auth_user.id)
        .single()
        .execute()
    )

    profile = result.data if result.data else {}

    return (
        auth_user.model_dump(),
        profile,
        {
            "access_token": session.access_token if session else "",
            "refresh_token": session.refresh_token if session else "",
            "expires_in": session.expires_in if session else 3600,
        },
    )


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------


async def logout_user(auth_client: Client) -> None:
    """Sign out the current user."""
    auth_client.auth.sign_out()


# ---------------------------------------------------------------------------
# Token Refresh
# ---------------------------------------------------------------------------


async def refresh_session(
    auth_client: Client, refresh_token: str
) -> Tuple[str, str, int]:
    """Refresh an expired access token."""
    response = auth_client.auth.refresh_session(refresh_token)

    if response.session is None:
        raise ValueError("Invalid or expired refresh token")

    return (
        response.session.access_token,
        response.session.refresh_token,
        response.session.expires_in or 3600,
    )


# ---------------------------------------------------------------------------
# Password Reset Flow
# ---------------------------------------------------------------------------


async def send_password_reset(auth_client: Client, email: str) -> None:
    """Send password reset email."""
    auth_client.auth.reset_password_for_email(email)


async def reset_password(auth_client: Client, new_password: str) -> None:
    """Update the authenticated user's password."""
    auth_client.auth.update_user({"password": new_password})


# ---------------------------------------------------------------------------
# Email Verification
# ---------------------------------------------------------------------------


async def verify_email(auth_client: Client, token: str) -> None:
    """Verify user email via token."""
    auth_client.auth.verify_otp({"token": token, "type": "email"})


# ---------------------------------------------------------------------------
# Profile Helpers (DB-only operations)
# ---------------------------------------------------------------------------


async def get_profile(db_client: Client, auth_user_id: str) -> dict:
    """Fetch user_profiles row by auth_user_id."""
    result = (
        db_client.table("user_profiles")
        .select("*")
        .eq("auth_user_id", auth_user_id)
        .single()
        .execute()
    )
    return result.data if result.data else {}


async def update_profile(
    db_client: Client, auth_user_id: str, updates: dict
) -> dict:
    """Update user_profiles fields."""
    allowed = {"full_name", "phone", "country", "base_currency", "timezone"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    if not filtered:
        raise ValueError("No updatable fields provided")

    result = (
        db_client.table("user_profiles")
        .update(filtered)
        .eq("auth_user_id", auth_user_id)
        .execute()
    )
    return result.data[0] if result.data else {}
