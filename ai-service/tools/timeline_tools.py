"""Timeline-related tools for the agent."""

from __future__ import annotations
import json
from langchain_core.tools import tool

_api = None


def set_context(api):
    global _api
    _api = api


@tool
async def get_timeline() -> str:
    """Get the couple's timeline events (important moments)."""
    if _api is None:
        return "API not available"
    try:
        resp = await _api.get("/api/timeline")
        events = resp.get("data", [])
        if not events:
            return "No timeline events yet"
        return json.dumps(
            [{"title": e["title"], "date": e["eventDate"], "icon": e["icon"], "desc": e.get("description", "")}
             for e in events],
            ensure_ascii=False,
        )
    except Exception as e:
        return f"Failed to get timeline: {e}"


@tool
async def record_event(title: str, date: str, description: str = "", icon: str = "💕") -> str:
    """Record an important event to the couple's timeline.

    Args:
        title: Event title
        date: Date in YYYY-MM-DD format
        description: What happened
        icon: Emoji icon
    """
    if _api is None:
        return "API not available"
    try:
        await _api.post("/api/timeline", {
            "eventDate": date,
            "title": title,
            "description": description,
            "icon": icon,
        })
        return f"Event recorded: {icon} {title} on {date}"
    except Exception as e:
        return f"Failed to record event: {e}"
