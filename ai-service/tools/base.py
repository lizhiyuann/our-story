"""Node.js 后端 API 的异步 HTTP 客户端。"""

from __future__ import annotations
import time
import httpx
from logger import get_logger, log_event

logger = get_logger("tools.api")


class ApiClient:
    """
    Node.js 后端 API 客户端，为指定用户提供数据访问。

    属性：
        base_url: API 基础地址（如 http://server:3001）
        user_id:  当前用户 ID（通过 X-Agent-User-Id 头传递）

    支持方法：
        get():    GET 请求
        post():   POST 请求
        delete(): DELETE 请求

    所有请求自动携带 X-Agent-User-Id 头，用于 Node.js 端的认证。
    """

    def __init__(self, base_url: str, user_id: int):
        self.base_url = base_url.rstrip("/")
        self.user_id = user_id

    async def get(self, path: str, params: dict | None = None) -> dict:
        """发起 GET 请求，返回 JSON 响应。"""
        return await self._request("GET", path, params=params)

    async def post(self, path: str, data: dict | None = None) -> dict:
        """发起 POST 请求，返回 JSON 响应。"""
        return await self._request("POST", path, json=data)

    async def delete(self, path: str) -> dict:
        """发起 DELETE 请求，返回 JSON 响应。"""
        return await self._request("DELETE", path)

    async def _request(self, method: str, path: str, **kwargs) -> dict:
        """
        内部请求方法，统一处理错误和日志。

        参数：
            method: HTTP 方法（GET/POST/DELETE）
            path:   API 路径（如 /api/moods）
            **kwargs: 传递给 httpx 的额外参数

        返回：
            API 响应的 JSON 数据

        异常：
            httpx.HTTPStatusError: API 返回非 2xx 状态码
            httpx.ConnectError:    无法连接到后端
        """
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
                    方法=method, 路径=path, 状态码=resp.status_code, 耗时ms=elapsed,
                )
                resp.raise_for_status()
                return resp.json()
        except Exception as exc:
            elapsed = int((time.monotonic() - start) * 1000)
            log_event(
                logger, 40, "tool.call.api_error",
                方法=method, 路径=path, 错误=str(exc), 耗时ms=elapsed,
            )
            raise
