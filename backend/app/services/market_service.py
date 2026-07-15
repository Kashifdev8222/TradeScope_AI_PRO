"""
TradeScope AI — Market Data Service
"""
import random
import time
from typing import Optional
from supabase import Client


# ---------------------------------------------------------------------------
# Instruments
# ---------------------------------------------------------------------------


async def list_instruments(
    db: Client,
    asset_class: Optional[str] = None,
    status: str = "active",
    search: Optional[str] = None,
) -> list[dict]:
    """List instruments with optional filters."""
    query = db.table("instruments").select("*")
    if asset_class:
        query = query.eq("asset_class", asset_class)
    if status:
        query = query.eq("status", status)
    if search:
        query = query.or_(f"symbol.ilike.%{search}%,name.ilike.%{search}%")
    result = query.order("symbol").execute()
    return result.data or []


async def get_instrument(db: Client, symbol: str) -> dict:
    """Get a single instrument by symbol."""
    result = (
        db.table("instruments")
        .select("*")
        .eq("symbol", symbol.upper())
        .single()
        .execute()
    )
    return result.data if result.data else {}


async def get_asset_classes(db: Client) -> list[str]:
    """Get distinct asset classes."""
    result = (
        db.table("instruments")
        .select("asset_class")
        .eq("status", "active")
        .execute()
    )
    classes = set()
    for row in (result.data or []):
        classes.add(row["asset_class"])
    return sorted(classes)


# ---------------------------------------------------------------------------
# Quotes — simulation generator for demo mode
# ---------------------------------------------------------------------------

# Simple price simulation state (in-memory, per session)
_price_state: dict = {}


def _seed_price(symbol: str) -> float:
    """Seed a realistic base price for a symbol."""
    seed_map = {
        "EURUSD": 1.0850, "GBPUSD": 1.2650, "USDJPY": 151.50, "USDCHF": 0.9050,
        "AUDUSD": 0.6550, "USDCAD": 1.3580, "NZDUSD": 0.5950,
        "EURGBP": 0.8570, "EURJPY": 164.50, "GBPJPY": 191.50,
        "US30": 39200, "SPX500": 5250, "NAS100": 18400, "UK100": 7950,
        "GER40": 18200, "JPN225": 39200,
        "XAUUSD": 2350, "XAGUSD": 29.50, "USOIL": 78.50, "UKOIL": 82.50,
        "BTCUSD": 67500, "ETHUSD": 3450, "XRPUSD": 0.62,
        "AAPL": 185, "MSFT": 420, "GOOGL": 175, "AMZN": 185, "TSLA": 195, "NVDA": 880,
    }
    return seed_map.get(symbol, 100.0)


async def get_quotes(db: Client, symbols: Optional[list[str]] = None) -> list[dict]:
    """Get live-like quotes for instruments. Simulated for demo mode."""
    query = db.table("instruments").select("symbol,asset_class,quote_currency").eq("status", "active")
    if symbols:
        query = query.in_("symbol", [s.upper() for s in symbols])
    instruments = query.execute().data or []

    results = []
    now = int(time.time() * 1000)

    for inst in instruments:
        symbol = inst["symbol"]
        base = _price_state.get(symbol) or _seed_price(symbol)

        # Random walk simulation
        change_pct = random.gauss(0, 0.0008)  # ~0.08% std dev
        price = base * (1 + change_pct)
        _price_state[symbol] = price

        # Calculate spread based on asset class
        if inst["asset_class"] == "forex":
            spread = price * 0.00015
        elif inst["asset_class"] == "crypto":
            spread = price * 0.002
        elif inst["asset_class"] == "indices":
            spread = price * 0.0003
        elif inst["asset_class"] == "commodities":
            spread = price * 0.0005
        else:
            spread = price * 0.0008

        bid = round(price - spread / 2, 5 if inst["asset_class"] == "forex" else 2)
        ask = round(price + spread / 2, 5 if inst["asset_class"] == "forex" else 2)

        results.append({
            "symbol": symbol,
            "asset_class": inst["asset_class"],
            "bid": bid,
            "ask": ask,
            "last": round(price, 5 if inst["asset_class"] == "forex" else 2),
            "spread": round(ask - bid, 5 if inst["asset_class"] == "forex" else 2),
            "change_pct": round(random.gauss(0, 0.3), 2),
            "quote_currency": inst["quote_currency"],
            "timestamp": now,
        })

    return results


async def get_candles(
    db: Client,
    symbol: str,
    timeframe: str = "1h",
    limit: int = 100,
) -> list[dict]:
    """Get candle data. Returns simulated data if none in DB."""
    result = (
        db.table("candles")
        .select("*")
        .eq("instrument_id", f"instruments.symbol.eq.{symbol.upper()}")
        .eq("timeframe", timeframe)
        .order("open_time", desc=True)
        .limit(limit)
        .execute()
    )

    if result.data:
        return sorted(result.data, key=lambda x: x["open_time"])

    # Generate simulated candles if none in DB
    return _generate_simulated_candles(symbol, timeframe, limit)


def _generate_simulated_candles(symbol: str, timeframe: str, limit: int) -> list[dict]:
    """Generate simulated OHLC candles."""
    candles = []
    base = _price_state.get(symbol) or _seed_price(symbol)
    now = int(time.time())

    # Timeframe in seconds
    tf_map = {"1m": 60, "5m": 300, "15m": 900, "30m": 1800, "1h": 3600, "4h": 14400, "1d": 86400, "1w": 604800}
    tf_seconds = tf_map.get(timeframe, 3600)

    for i in range(limit - 1, -1, -1):
        open_time = now - (i + 1) * tf_seconds
        close_time = open_time + tf_seconds

        volatility = 0.003 if symbol in ("BTCUSD", "ETHUSD") else 0.001
        open_price = base * (1 + random.gauss(0, volatility))
        high = open_price * (1 + abs(random.gauss(0, volatility)))
        low = open_price * (1 - abs(random.gauss(0, volatility * 0.7)))
        close = low + random.random() * (high - low)
        volume = random.randint(100, 10000)

        base = close
        candles.append({
            "symbol": symbol,
            "timeframe": timeframe,
            "open_time": open_time,
            "close_time": close_time,
            "open": round(open_price, 5),
            "high": round(high, 5),
            "low": round(low, 5),
            "close": round(close, 5),
            "volume": volume,
        })

    return candles
