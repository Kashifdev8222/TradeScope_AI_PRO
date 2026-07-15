"""
TradeScope AI — Market Data Router
Endpoints: /api/v1/market/*
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from typing import Optional

from app.dependencies import get_supabase_db, get_current_user_id
from app.services import market_service

router = APIRouter(prefix="/market", tags=["Market Data"])


# ---------------------------------------------------------------------------
# GET /market/instruments
# ---------------------------------------------------------------------------
@router.get("/instruments")
async def list_instruments(
    asset_class: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Client = Depends(get_supabase_db),
    user_id: str = Depends(get_current_user_id),
):
    """List available trading instruments. Client + Admin access."""
    return await market_service.list_instruments(db, asset_class, "active", search)


# ---------------------------------------------------------------------------
# GET /market/instruments/{symbol}
# ---------------------------------------------------------------------------
@router.get("/instruments/{symbol}")
async def get_instrument(
    symbol: str,
    db: Client = Depends(get_supabase_db),
    user_id: str = Depends(get_current_user_id),
):
    """Get details for a single instrument."""
    inst = await market_service.get_instrument(db, symbol)
    if not inst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instrument not found")
    return inst


# ---------------------------------------------------------------------------
# GET /market/quotes
# ---------------------------------------------------------------------------
@router.get("/quotes")
async def get_quotes(
    symbols: Optional[str] = Query(None, description="Comma-separated symbols, e.g. EURUSD,BTCUSD"),
    db: Client = Depends(get_supabase_db),
    user_id: str = Depends(get_current_user_id),
):
    """Get live-like quotes for instruments. Simulated for demo mode."""
    sym_list = [s.strip().upper() for s in symbols.split(",")] if symbols else None
    return await market_service.get_quotes(db, sym_list)


# ---------------------------------------------------------------------------
# GET /market/candles
# ---------------------------------------------------------------------------
@router.get("/candles")
async def get_candles(
    symbol: str = Query(..., description="Instrument symbol"),
    timeframe: str = Query("1h", description="1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w"),
    limit: int = Query(100, ge=1, le=500),
    db: Client = Depends(get_supabase_db),
    user_id: str = Depends(get_current_user_id),
):
    """Get OHLC candle data for charting."""
    valid_tf = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"]
    if timeframe not in valid_tf:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid timeframe. Must be one of: {valid_tf}")
    return await market_service.get_candles(db, symbol, timeframe, limit)


# ---------------------------------------------------------------------------
# GET /market/asset-classes
# ---------------------------------------------------------------------------
@router.get("/asset-classes")
async def get_asset_classes(
    db: Client = Depends(get_supabase_db),
    user_id: str = Depends(get_current_user_id),
):
    """Get distinct asset classes."""
    return await market_service.get_asset_classes(db)
