"""心情相关工具：获取最近心情、记录新心情。"""

from __future__ import annotations
import json
from langchain_core.tools import tool

_api = None


def set_context(api):
    """注入 API 客户端。"""
    global _api
    _api = api


@tool
async def get_recent_moods() -> str:
    """
    获取用户最近的心情记录，用于了解情绪状态。

    返回：
        最近 10 条心情记录（JSON 格式，含表情、类型、内容、时间）
    """
    if _api is None:
        return "API 不可用"
    try:
        resp = await _api.get("/api/moods", {"limit": "10"})
        moods = resp.get("data", [])
        if not moods:
            return "还没有心情记录"
        return json.dumps(
            [{"表情": m["emoji"], "类型": m["moodType"], "内容": m["content"], "时间": m["createdAt"]}
             for m in moods],
            ensure_ascii=False,
        )
    except Exception as e:
        return f"获取心情失败：{e}"


@tool
async def record_mood(mood_type: str, emoji: str, content: str) -> str:
    """
    为用户记录一条心情。

    参数：
        mood_type: 心情类型（happy/love/sad/angry/thinking/sleepy）
        emoji:     对应的表情符号
        content:   心情描述文字
    """
    if _api is None:
        return "API 不可用"
    try:
        await _api.post("/api/moods", {"moodType": mood_type, "emoji": emoji, "content": content})
        return f"已记录心情：{emoji} {content}"
    except Exception as e:
        return f"记录心情失败：{e}"
