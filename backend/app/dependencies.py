"""
TradeScope AI — FastAPI Dependencies
Provides reusable dependencies for auth, database, and role checks.

CRITICAL: We keep TWO admin clients separate:
- get_supabase_auth  → for auth operations (sign_up, sign_in, etc.)
- get_supabase_db    → for DB table operations (insert, select, etc.)

This prevents the DB client's session from being contaminated by auth calls.
When sign_up() sets a user session, the DB client stays on the service_role key.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from supabase import create_client, Client
from app.config import settings

# ---------------------------------------------------------------------------
# Auth-only client (for sign_up, sign_in, etc.)
# Session changes here won't affect DB operations
# ---------------------------------------------------------------------------
_supabase_auth: Optional[Client] = None


def get_supabase_auth() -> Client:
    """Return a Supabase client for auth operations ONLY."""
    global _supabase_auth
    if _supabase_auth is None:
        _supabase_auth = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY
        )
    return _supabase_auth


# ---------------------------------------------------------------------------
# DB-only client (for table operations)
# NEVER used for auth — stays on service_role key forever
# ---------------------------------------------------------------------------
_supabase_db: Optional[Client] = None


def get_supabase_db() -> Client:
    """Return a Supabase client for DB table operations ONLY. Never contaminated by auth."""
    global _supabase_db
    if _supabase_db is None:
        _supabase_db = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY
        )
    return _supabase_db


# Alias for backward compatibility
def get_supabase_admin() -> Client:
    """DEPRECATED: Use get_supabase_db() for DB ops, get_supabase_auth() for auth."""
    return get_supabase_db()


# ---------------------------------------------------------------------------
# Public client (uses anon key — respects RLS)
# ---------------------------------------------------------------------------
_supabase_public: Optional[Client] = None


def get_supabase_public() -> Client:
    """Return a Supabase client scoped to the public (anon) key."""
    global _supabase_public
    if _supabase_public is None:
        _supabase_public = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY
        )
    return _supabase_public


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------


async def get_current_user_id(
    authorization: str = Header(..., description="Bearer <token>"),
    supabase: Client = Depends(get_supabase_auth),
) -> str:
    """Validate the JWT and return the auth.users.id (UUID)."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header",
        )
    token = authorization.split(" ", 1)[1]

    try:
        user = supabase.auth.get_user(token)
        if user is None or user.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
            )
        return user.user.id
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )


async def get_profile_id(
    auth_user_id: str = Depends(get_current_user_id),
    supabase: Client = Depends(get_supabase_db),
) -> str:
    """Resolve auth.users.id → public.user_profiles.id."""
    result = (
        supabase.table("user_profiles")
        .select("id")
        .eq("auth_user_id", auth_user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User profile not found",
        )
    return result.data["id"]


# ---------------------------------------------------------------------------
# Role-based access control
# ---------------------------------------------------------------------------

async def get_user_roles(
    profile_id: str = Depends(get_profile_id),
    supabase: Client = Depends(get_supabase_db),
) -> list[str]:
    """Return list of role codes for the current user."""
    result = (
        supabase.table("user_roles")
        .select("role_id, roles(code)")
        .eq("user_id", profile_id)
        .execute()
    )
    if not result.data:
        return []
    return [r["roles"]["code"] for r in result.data if r.get("roles")]


def require_role(*allowed_roles: str):
    """
    FastAPI dependency factory: only allows access if user has one of the given roles.
    Usage: Depends(require_role("super_admin", "user_admin"))
    """

    async def checker(
        profile_id: str = Depends(get_profile_id),
        supabase: Client = Depends(get_supabase_db),
    ) -> str:
        result = (
            supabase.table("user_roles")
            .select("role_id, roles(code)")
            .eq("user_id", profile_id)
            .execute()
        )
        user_role_codes = [
            r["roles"]["code"] for r in result.data if r.get("roles")
        ] if result.data else []

        if not any(rc in allowed_roles for rc in user_role_codes):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this action",
            )
        return profile_id

    return checker


def require_admin():
    """Require ANY admin role to access the endpoint."""
    return require_role(
        "super_admin", "user_admin", "finance_admin",
        "risk_manager", "compliance_admin", "support_agent", "auditor"
    )
