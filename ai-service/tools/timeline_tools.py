"""时间轴相关工具：获取事件列表、记录新事件。"""

from __future__ import annotations
import json
from langchain_core.tools import tool

_api = None


def set_context(api):
    """注入 API 客户端。"""
    global _api
    _api = api


@tool
async def get_timeline() -> str:
    """
    获取情侣时间轴上的所有重要事件。

    返回：
        事件列表（JSON 格式，含标题、日期、描述、图标）
    """
    if _api is None:
        return "API 不可用"
    try:
        resp = await _api.get("/api/timeline")
        events = resp.get("data", [])
        if not events:
            return "还没有时间轴事件"
        return json.dumps(
            [{"标题": e["title"], "日期": e["eventDate"], "图标": e["icon"], "描述": e.get("description", "")}
             for e in events],
            ensure_ascii=False,
        )
    except Exception as e:
        return f"获取时间轴失败：{e}"


@tool
async def record_event(title: str, date: str, description: str = "", icon: str = "💕") -> str:
    """
    记录一个重要事件到时间轴。

    参数：
        title:       事件标题
        date:        日期（YYYY-MM-DD 格式）
        description: 事件描述（可选）
        icon:        图标表情（默认 💕）
    """
    if _api is None:
        return "API 不可用"
    try:
        await _api.post("/api/timeline", {"eventDate": date, "title": title, "description": description, "icon": icon})
        return f"已记录事件：{icon} {title}（{date}）"
    except Exception as e:
        return f"记录事件失败：{e}"
