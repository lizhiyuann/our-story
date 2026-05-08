"""记忆相关工具：保存、搜索长期记忆，获取用户偏好。"""

from __future__ import annotations
import json
from langchain_core.tools import tool
from memory.models import MemoryEntry

# 运行时由 Agent 注入的上下文
_long_term = None  # LongTermMemory 实例
_api = None        # ApiClient 实例


def set_context(long_term, api):
    """注入长期记忆和 API 客户端（每次请求时调用）。"""
    global _long_term, _api
    _long_term = long_term
    _api = api


@tool
async def save_memory(content: str, memory_type: str, importance: float = 0.5) -> str:
    """
    保存重要信息到长期记忆（ChromaDB 向量数据库）。

    参数：
        content:      要记住的内容（如"她喜欢向日葵"）
        memory_type:  记忆类型 - "conversation"(对话) / "preference"(偏好) / "event"(事件) / "emotion_pattern"(情绪模式)
        importance:   重要程度（0.0-1.0），越高越容易被检索到

    返回：
        确认消息
    """
    if _long_term is None:
        return "记忆系统不可用"
    entry = MemoryEntry(content=content, memory_type=memory_type, importance=importance)
    await _long_term.save(_api.user_id, entry)
    return f"已保存到记忆：{content[:50]}..."


@tool
async def search_memory(query: str) -> str:
    """
    用自然语言搜索过去的记忆和对话。

    参数：
        query: 搜索内容（如"工作压力"、"喜欢什么花"）

    返回：
        相关记忆列表（JSON 格式，含内容和相似度分数）
    """
    if _long_term is None:
        return "记忆系统不可用"
    results = await _long_term.search(_api.user_id, query, k=5)
    if not results:
        return "没有找到相关记忆"
    return json.dumps(
        [{"content": r["content"], "相关度": round(r["score"], 2)} for r in results],
        ensure_ascii=False,
    )


@tool
async def get_user_preferences() -> str:
    """获取已知的用户偏好和习惯（如喜欢的食物、讨厌的事物等）。"""
    if _long_term is None:
        return "记忆系统不可用"
    results = await _long_term.search(_api.user_id, "偏好 习惯 喜欢 讨厌", k=10)
    prefs = [r for r in results if r["metadata"].get("type") == "preference"]
    if not prefs:
        return "还没有记录任何偏好"
    return json.dumps([p["content"] for p in prefs], ensure_ascii=False)
