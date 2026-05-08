"""Countdown-related tools for the agent."""

from __future__ import annotations
import json
from langchain_core.tools import tool

_api = None


def set_context(api):
    global _api
    _api = api


@tool
async def get_countdowns() -> str:
    """Get all countdowns (upcoming events like birthdays, anniversaries)."""
    if _api is None:
        return "API not available"
    try:
        resp = await _api.get("/api/countdowns")
        items = resp.get("data", [])
        if not items:
            return "No countdowns set"
        return json.dumps(
            [{"id": c["id"], "title": c["title"], "date": c["targetDate"], "icon": c["icon"]}
             for c in items],
            ensure_ascii=False,
        )
    except Exception as e:
        return f"Failed to get countdowns: {e}"


@tool
async def create_countdown(title: str, target_date: str, icon: str = "❤️") -> str:
    """Create a new countdown for an important date.

    Args:
        title: Event name (e.g. "Birthday", "Anniversary")
        target_date: Target date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM)
        icon: Emoji icon for the countdown
    """
    if _api is None:
        return "API not available"
    try:
        await _api.post("/api/countdowns", {
            "title": title,
            "targetDate": target_date,
            "icon": icon,
        })
        return f"Countdown created: {icon} {title} on {target_date}"
    except Exception as e:
        return f"Failed to create countdown: {e}"
