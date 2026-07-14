"""
Simple in-memory rate limiter middleware.
Slows down brute-force attacks on auth endpoints.
"""
import time
import threading
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status

# (count, window_start) per key
_store: Dict[str, Tuple[int, float]] = {}
_lock = threading.Lock()
CLEANUP_INTERVAL = 300  # Cleanup old entries every 5 min
_last_cleanup = time.time()


def _cleanup():
    """Remove expired entries."""
    global _last_cleanup
    now = time.time()
    to_delete = [k for k, (_, start) in _store.items() if now - start > 60]
    for k in to_delete:
        del _store[k]
    _last_cleanup = now


async def rate_limit_middleware(request: Request, call_next):
    """
    Rate limit: 30 requests per 60 seconds per IP for auth endpoints.
    Applies to /api/v1/auth/* paths only.
    """
    if not request.url.path.startswith("/api/v1/auth"):
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    key = f"{client_ip}:{request.url.path}"

    with _lock:
        # Periodic cleanup
        if time.time() - _last_cleanup > CLEANUP_INTERVAL:
            _cleanup()

        now = time.time()
        count, window_start = _store.get(key, (0, now))

        # Reset window if > 60 seconds passed
        if now - window_start > 60:
            count = 0
            window_start = now

        count += 1
        _store[key] = (count, window_start)

        # Rate limit: 30 requests per minute per endpoint per IP
        if count > 30:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )

    return await call_next(request)
