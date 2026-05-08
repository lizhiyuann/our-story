"""Memory-related tools for the agent."""

from __future__ import annotations
import json
from langchain_core.tools import tool
from memory.models import MemoryEntry

# These are set by the agent at request time
_long_term = None
_api = None


def set_context(long_term, api):
    global _long_term, _api
    _long_term = long_term
    _api = api


@tool
async def save_memory(content: str, memory_type: str, importance: float = 0.5) -> str:
    """Save important information to long-term memory.

    Args:
        content: The information to remember
        memory_type: Type of memory - "conversation", "preference", "event", or "emotion_pattern"
        importance: How important (0.0 to 1.0), higher = more important
    """
    if _long_term is None:
        return "Memory system not available"
    entry = MemoryEntry(content=content, memory_type=memory_type, importance=importance)
    await _long_term.save(_api.user_id, entry)
    return f"Saved to memory: {content[:50]}..."


@tool
async def search_memory(query: str) -> str:
    """Search past conversations, preferences, and events by meaning.

    Args:
        query: What to search for (natural language)
    """
    if _long_term is None:
        return "Memory system not available"
    results = await _long_term.search(_api.user_id, query, k=5)
    if not results:
        return "No related memories found"
    return json.dumps(
        [{"content": r["content"], "relevance": round(r["score"], 2)} for r in results],
        ensure_ascii=False,
    )


@tool
async def get_user_preferences() -> str:
    """Get known preferences and habits of the user."""
    if _long_term is None:
        return "Memory system not available"
    results = await _long_term.search(_api.user_id, "偏好 习惯 喜欢 讨厌", k=10)
    prefs = [r for r in results if r["metadata"].get("type") == "preference"]
    if not prefs:
        return "No preferences recorded yet"
    return json.dumps(
        [p["content"] for p in prefs],
        ensure_ascii=False,
    )
