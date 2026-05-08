"""Mood-related tools for the agent."""

from __future__ import annotations
import json
from langchain_core.tools import tool

_api = None


def set_context(api):
    global _api
    _api = api


@tool
async def get_recent_moods() -> str:
    """Get the user's recent mood entries to understand their emotional state."""
    if _api is None:
        return "API not available"
    try:
        resp = await _api.get("/api/moods", {"limit": "10"})
        moods = resp.get("data", [])
        if not moods:
            return "No mood records found"
        return json.dumps(
            [{"emoji": m["emoji"], "type": m["moodType"], "content": m["content"], "time": m["createdAt"]}
             for m in moods],
            ensure_ascii=False,
        )
    except Exception as e:
        return f"Failed to get moods: {e}"


@tool
async def record_mood(mood_type: str, emoji: str, content: str) -> str:
    """Record a mood entry for the user.

    Args:
        mood_type: One of "happy", "love", "sad", "angry", "thinking", "sleepy"
        emoji: The emoji for this mood
        content: Description of the mood
    """
    if _api is None:
        return "API not available"
    try:
        await _api.post("/api/moods", {
            "moodType": mood_type,
            "emoji": emoji,
            "content": content,
        })
        return f"Mood recorded: {emoji} {content}"
    except Exception as e:
        return f"Failed to record mood: {e}"
