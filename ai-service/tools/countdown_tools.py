"""倒计时相关工具：获取倒计时列表、创建新倒计时。"""

from __future__ import annotations
import json
from langchain_core.tools import tool

_api = None


def set_context(api):
    """注入 API 客户端。"""
    global _api
    _api = api


@tool
async def get_countdowns() -> str:
    """
    获取所有倒计时（即将到来的重要日子）。

    返回：
        倒计时列表（JSON 格式，含标题、日期、图标）
    """
    if _api is None:
        return "API 不可用"
    try:
        resp = await _api.get("/api/countdowns")
        items = resp.get("data", [])
        if not items:
            return "还没有设置倒计时"
        return json.dumps(
            [{"id": c["id"], "标题": c["title"], "日期": c["targetDate"], "图标": c["icon"]}
             for c in items],
            ensure_ascii=False,
        )
    except Exception as e:
        return f"获取倒计时失败：{e}"


@tool
async def create_countdown(title: str, target_date: str, icon: str = "❤️") -> str:
    """
    创建一个新的倒计时。

    参数：
        title:       事件名称（如"生日"、"纪念日"）
        target_date: 目标日期（ISO 格式，如 2026-12-31 或 2026-12-31T00:00）
        icon:        图标表情（默认 ❤️）
    """
    if _api is None:
        return "API 不可用"
    try:
        await _api.post("/api/countdowns", {"title": title, "targetDate": target_date, "icon": icon})
        return f"已创建倒计时：{icon} {title}（{target_date}）"
    except Exception as e:
        return f"创建倒计时失败：{e}"
