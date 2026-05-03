import json
import logging
from typing import Any

import redis as redis_lib

from config import settings

logger = logging.getLogger(__name__)

_redis_client: redis_lib.Redis | None = None


def get_redis() -> redis_lib.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis_lib.Redis.from_url(
            settings.redis_url,
            ssl=True,
            ssl_cert_reqs=None,
            socket_connect_timeout=3,
            socket_timeout=3,
            retry_on_timeout=True,
            decode_responses=True,
        )
    return _redis_client


async def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    try:
        client = get_redis()
        serialized = json.dumps(value, default=str)
        client.setex(key, ttl, serialized)
    except Exception as exc:
        logger.warning("cache_set failed for key=%s: %s", key, exc)


async def cache_get(key: str) -> Any | None:
    try:
        client = get_redis()
        raw = client.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception as exc:
        logger.warning("cache_get failed for key=%s: %s", key, exc)
        return None


async def cache_delete(key: str) -> None:
    try:
        client = get_redis()
        client.delete(key)
    except Exception as exc:
        logger.warning("cache_delete failed for key=%s: %s", key, exc)


async def cache_delete_pattern(pattern: str) -> None:
    try:
        client = get_redis()
        keys = client.keys(pattern)
        if keys:
            client.delete(*keys)
    except Exception as exc:
        logger.warning("cache_delete_pattern failed for pattern=%s: %s", pattern, exc)