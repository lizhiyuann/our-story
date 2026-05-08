"""偏好学习工具：从对话中提取并保存用户偏好。"""

from __future__ import annotations
from langchain_core.tools import tool
from memory.models import MemoryEntry

_long_term = None
_api = None


def set_context(long_term, api):
    """注入长期记忆和 API 客户端。"""
    global _long_term, _api
    _long_term = long_term
    _api = api


@tool
async def update_user_preference(key: str, value: str, importance: float = 0.7) -> str:
    """
    保存一条用户偏好到长期记忆。

    参数：
        key:        偏好类别（如 "喜欢的花"、"食物口味"）
        value:      偏好值（如 "向日葵"、"不辣"）
        importance: 重要程度（0.0-1.0，默认 0.7）
    """
    if _long_term is None:
        return "记忆系统不可用"
    entry = MemoryEntry(
        content=f"{key}: {value}",
        memory_type="preference",
        importance=importance,
        metadata={"key": key, "value": value},
    )
    await _long_term.save(_api.user_id, entry)
    return f"已保存偏好：{key} = {value}"
