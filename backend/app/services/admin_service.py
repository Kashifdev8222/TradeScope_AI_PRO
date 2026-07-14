"""
TradeScope AI — Admin Service
User management, role checks, platform oversight logic.
"""
from typing import Optional
from supabase import Client


# ---------------------------------------------------------------------------
# Role helpers
# ---------------------------------------------------------------------------


async def get_user_roles(db_client: Client, user_profile_id: str) -> list[dict]:
    """Get all roles assigned to a user."""
    result = (
        db_client.table("user_roles")
        .select("role_id, roles(code, name)")
        .eq("user_id", user_profile_id)
        .execute()
    )
    roles = []
    if result.data:
        for row in result.data:
            role_info = row.get("roles", {})
            roles.append({
                "role_id": row["role_id"],
                "code": role_info.get("code", ""),
                "name": role_info.get("name", ""),
            })
    return roles


async def user_has_role(db_client: Client, user_profile_id: str, role_code: str) -> bool:
    """Check if a user has a specific role."""
    result = (
        db_client.table("user_roles")
        .select("id")
        .eq("user_id", user_profile_id)
        .eq("roles.code", role_code)
        .execute()
    )
    return bool(result.data)


async def user_has_any_admin_role(db_client: Client, user_profile_id: str) -> bool:
    """Check if a user has ANY admin role."""
    admin_codes = [
        "super_admin", "user_admin", "finance_admin",
        "risk_manager", "compliance_admin", "support_agent", "auditor"
    ]
    result = (
        db_client.table("user_roles")
        .select("id")
        .eq("user_id", user_profile_id)
        .in_("roles.code", admin_codes)
        .execute()
    )
    return bool(result.data)


# ---------------------------------------------------------------------------
# User directory
# ---------------------------------------------------------------------------


async def list_users(
    db_client: Client,
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[str] = None,
    kyc_filter: Optional[str] = None,
    ai_filter: Optional[bool] = None,
    search: Optional[str] = None,
) -> dict:
    """List all users with filters (admin view)."""
    query = db_client.table("user_profiles").select(
        "id, client_code, full_name, phone, country, status, kyc_status, "
        "base_currency, created_at, auth_user_id"
    )

    if status_filter:
        query = query.eq("status", status_filter)
    if kyc_filter:
        query = query.eq("kyc_status", kyc_filter)
    if search:
        query = query.or_(f"full_name.ilike.%{search}%,client_code.ilike.%{search}%")

    # Get total count
    count_query = db_client.table("user_profiles").select("id", count="exact")
    if status_filter:
        count_query = count_query.eq("status", status_filter)
    if kyc_filter:
        count_query = count_query.eq("kyc_status", kyc_filter)
    if search:
        count_query = count_query.or_(f"full_name.ilike.%{search}%,client_code.ilike.%{search}%")

    total_result = count_query.execute()
    total = total_result.count if total_result.count else 0

    # Paginate
    offset = (page - 1) * page_size
    result = query.range(offset, offset + page_size - 1).order("created_at", desc=True).execute()

    return {
        "users": result.data or [],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }


async def get_user_detail(db_client: Client, auth_client: Client, user_profile_id: str) -> dict:
    """Get full detail for a single user (admin view)."""
    # Profile
    result = (
        db_client.table("user_profiles")
        .select("*")
        .eq("id", user_profile_id)
        .single()
        .execute()
    )
    profile = result.data
    if not profile:
        raise ValueError("User not found")

    # Email from auth
    email = ""
    try:
        user = auth_client.auth.admin.get_user_by_id(profile["auth_user_id"])
        if user and user.user:
            email = user.user.email or ""
    except Exception:
        pass

    # Roles
    roles = await get_user_roles(db_client, user_profile_id)

    # Trading accounts
    accounts_result = (
        db_client.table("trading_accounts")
        .select("*")
        .eq("user_id", user_profile_id)
        .execute()
    )

    return {
        "profile": {**profile, "email": email},
        "roles": roles,
        "trading_accounts": accounts_result.data or [],
    }


# ---------------------------------------------------------------------------
# User status actions
# ---------------------------------------------------------------------------


async def update_user_status(
    db_client: Client,
    user_profile_id: str,
    new_status: str,
    actor_id: str,
    reason: str,
) -> dict:
    """Change a user's status (activate, suspend, restrict, close)."""
    valid_statuses = ["active", "restricted", "suspended", "closed"]
    if new_status not in valid_statuses:
        raise ValueError(f"Invalid status: {new_status}")

    # Get previous state for audit
    prev = (
        db_client.table("user_profiles")
        .select("status")
        .eq("id", user_profile_id)
        .single()
        .execute()
    )
    previous_status = prev.data["status"] if prev.data else "unknown"

    # Update
    result = (
        db_client.table("user_profiles")
        .update({"status": new_status, "updated_at": "now()"})
        .eq("id", user_profile_id)
        .execute()
    )

    # Audit log
    db_client.table("audit_logs").insert({
        "actor_user_id": actor_id,
        "actor_role": "admin",
        "action": f"user.{new_status}",
        "resource_type": "user_profiles",
        "resource_id": user_profile_id,
        "previous_value": {"status": previous_status},
        "new_value": {"status": new_status},
        "reason": reason,
    }).execute()

    return result.data[0] if result.data else {}


async def set_user_ai_enabled(
    db_client: Client,
    user_profile_id: str,
    enabled: bool,
    actor_id: str,
    reason: str,
) -> dict:
    """Enable or disable AI for all of a user's trading accounts."""
    action = "ai.enable" if enabled else "ai.disable"

    # Update all trading accounts for this user
    (
        db_client.table("trading_accounts")
        .update({"ai_enabled": enabled, "updated_at": "now()"})
        .eq("user_id", user_profile_id)
        .execute()
    )

    # Audit log
    db_client.table("audit_logs").insert({
        "actor_user_id": actor_id,
        "actor_role": "admin",
        "action": action,
        "resource_type": "user_profiles",
        "resource_id": user_profile_id,
        "new_value": {"ai_enabled": enabled},
        "reason": reason,
    }).execute()

    return {"user_id": user_profile_id, "ai_enabled": enabled}


async def assign_role(
    db_client: Client,
    user_profile_id: str,
    role_code: str,
    assigned_by: str,
) -> dict:
    """Assign a role to a user."""
    # Get role ID
    role_result = (
        db_client.table("roles").select("id").eq("code", role_code).single().execute()
    )
    if not role_result.data:
        raise ValueError(f"Role not found: {role_code}")

    role_id = role_result.data["id"]

    # Check if already assigned
    existing = (
        db_client.table("user_roles")
        .select("id")
        .eq("user_id", user_profile_id)
        .eq("role_id", role_id)
        .execute()
    )
    if existing.data:
        return {"message": "Role already assigned"}

    # Assign
    result = (
        db_client.table("user_roles")
        .insert({
            "user_id": user_profile_id,
            "role_id": role_id,
            "assigned_by": assigned_by,
        })
        .execute()
    )

    # Audit
    db_client.table("audit_logs").insert({
        "actor_user_id": assigned_by,
        "actor_role": "admin",
        "action": "role.assigned",
        "resource_type": "user_roles",
        "resource_id": result.data[0]["id"] if result.data else None,
        "new_value": {"role_code": role_code},
    }).execute()

    return result.data[0] if result.data else {}
