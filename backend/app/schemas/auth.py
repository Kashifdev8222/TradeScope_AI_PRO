"""
TradeScope AI — Auth Schemas (Pydantic request/response models)
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=30)
    country: Optional[str] = Field(None, min_length=2, max_length=2)
    base_currency: str = Field("USD", min_length=3, max_length=3)
    timezone: str = "UTC"
    accept_terms: bool = Field(..., description="Must be true")
    accept_risk_disclosure: bool = Field(..., description="Must be true")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


class VerifyEmailRequest(BaseModel):
    token: str


# ---------------------------------------------------------------------------
# Response Schemas
# ---------------------------------------------------------------------------


class UserProfileResponse(BaseModel):
    id: str
    client_code: str
    full_name: str
    email: str
    phone: Optional[str]
    country: Optional[str]
    base_currency: str
    timezone: str
    status: str
    kyc_status: str
    risk_disclosure_version: Optional[str]
    terms_version: Optional[str]
    created_at: datetime
    updated_at: datetime


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class AuthResponse(BaseModel):
    user: UserProfileResponse
    tokens: AuthTokens


class LogoutResponse(BaseModel):
    message: str = "Logged out successfully"


class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None


class SessionInfo(BaseModel):
    id: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
    last_sign_in_at: Optional[datetime]
