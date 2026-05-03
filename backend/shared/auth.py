from functools import lru_cache
from typing import Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt

from config import settings

security = HTTPBearer()

# Module-level JWKS key cache: kid → key dict
_jwks_cache: dict[str, Any] = {}


@lru_cache(maxsize=1)
def _fetch_jwks() -> dict[str, Any]:
    """Fetch JWKS from Cognito and return a kid → key mapping.
    lru_cache ensures this survives across warm Lambda invocations."""
    response = httpx.get(settings.cognito_jwks_url, timeout=10)
    response.raise_for_status()
    keys = response.json().get("keys", [])
    return {k["kid"]: k for k in keys}


def _get_jwks() -> dict[str, Any]:
    global _jwks_cache
    if not _jwks_cache:
        _jwks_cache = _fetch_jwks()
    return _jwks_cache


def _clear_and_reload_jwks() -> dict[str, Any]:
    global _jwks_cache
    _fetch_jwks.cache_clear()
    _jwks_cache = _fetch_jwks()
    return _jwks_cache


def verify_cognito_token(token: str) -> dict:
    try:
        # Step 1: decode header to get kid (unverified)
        headers = jwt.get_unverified_headers(token)
        kid = headers.get("kid")
        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing kid header.",
            )

        # Step 2: look up kid in cached JWKS
        jwks = _get_jwks()
        if kid not in jwks:
            # Retry once with fresh JWKS
            jwks = _clear_and_reload_jwks()
            if kid not in jwks:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Unknown token signing key.",
                )

        # Step 3: construct public key
        key_data = jwks[kid]
        public_key = jwk.construct(key_data)

        # Step 4: decode and verify token
        claims = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return claims

    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(exc)}",
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    return verify_cognito_token(credentials.credentials)


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    claims = verify_cognito_token(credentials.credentials)
    sub = claims.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing sub claim.",
        )
    return sub