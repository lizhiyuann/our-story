"""Preference learning tools for the agent."""

from __future__ import annotations
from langchain_core.tools import tool
from memory.models import MemoryEntry

_long_term = None
_api = None


def set_context(long_term, api):
    global _long_term, _api
    _long_term = long_term
    _api = api


@tool
async def update_user_preference(key: str, value: str, importance: float = 0.7) -> str:
    """Learn and save a user preference (e.g. favorite flower, food, activity).

    Args:
        key: What the preference is about (e.g. "favorite_flower", "food_spice_tolerance")
        value: The preference value (e.g. "sunflowers", "low")
        importance: How important this preference is (0.0 to 1.0)
    """
    if _long_term is None:
        return "Memory system not available"
    entry = MemoryEntry(
        content=f"{key}: {value}",
        memory_type="preference",
        importance=importance,
        metadata={"key": key, "value": value},
    )
    await _long_term.save(_api.user_id, entry)
    return f"Preference saved: {key} = {value}"
