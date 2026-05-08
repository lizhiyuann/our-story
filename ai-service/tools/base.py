"""HTTP client for calling the Node.js backend API."""

from __future__ import annotations
import time
import httpx
from logger import get_logger, log_event

logger = get_logger("tools.api")


class ApiClient:
    """Async client for the Node.js backend, scoped to a single user."""

    def __init__(self, base_url: str, user_id: int):
        self.base_url = base_url.rstrip("/")
        self.user_id = user_id

    async def get(self, path: str, params: dict | None = None) -> dict:
        return await self._request("GET", path, params=params)

    async def post(self, path: str, data: dict | None = None) -> dict:
        return await self._request("POST", path, json=data)

    async def delete(self, path: str) -> dict:
        return await self._request("DELETE", path)

    async def _request(self, method: str, path: str, **kwargs) -> dict:
        url = f"{self.base_url}{path}"
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.request(
                    method,
                    url,
                    headers={"X-Agent-User-Id": str(self.user_id)},
                    **kwargs,
                )
                elapsed = int((time.monotonic() - start) * 1000)
                log_event(
                    logger, 20, "tool.call.api_request",
                    method=method, url=path, status=resp.status_code, duration_ms=elapsed,
                )
                resp.raise_for_status()
                return resp.json()
        except Exception as exc:
            elapsed = int((time.monotonic() - start) * 1000)
            log_event(
                logger, 40, "tool.call.api_error",
                method=method, url=path, error=str(exc), duration_ms=elapsed,
            )
            raise
