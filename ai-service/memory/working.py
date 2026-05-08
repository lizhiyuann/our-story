"""Working memory: real-time context loaded per request."""

from __future__ import annotations
import time
from dataclasses import dataclass, field
from logger import get_logger, log_event
from tools.base import ApiClient

logger = get_logger("memory.working")


@dataclass
class WorkingMemory:
    user_message: str = ""
    detected_emotion: str = ""
    recent_moods: list[dict] = field(default_factory=list)
    upcoming_events: list[dict] = field(default_factory=list)
    recent_rants: list[dict] = field(default_factory=list)
    user_preferences: dict = field(default_factory=dict)
    personality_params: dict = field(default_factory=dict)
    conversation_summary: str = ""


async def load_working_memory(
    api: ApiClient,
    user_message: str,
    long_term,  # LongTermMemory instance
    short_term_summary: str = "",
    personality_params: dict | None = None,
) -> WorkingMemory:
    """Build working memory from API + memory stores."""
    start = time.monotonic()
    wm = WorkingMemory(
        user_message=user_message,
        conversation_summary=short_term_summary,
        personality_params=personality_params or {},
    )

    # Parallel-ish data fetching (sequential but fast)
    try:
        moods_resp = await api.get("/api/moods", {"limit": "5"})
        wm.recent_moods = moods_resp.get("data", [])
    except Exception:
        pass

    try:
        countdown_resp = await api.get("/api/countdowns")
        wm.upcoming_events = countdown_resp.get("data", [])
    except Exception:
        pass

    try:
        rants_resp = await api.get("/api/rants", {"limit": "3"})
        wm.recent_rants = rants_resp.get("data", [])
    except Exception:
        pass

    # Search long-term memory for relevant context
    try:
        memories = await long_term.search(api.user_id, user_message, k=3)
        if memories:
            wm.user_preferences = {
                m["metadata"].get("key", ""): m["content"]
                for m in memories
                if m["metadata"].get("type") == "preference"
            }
    except Exception:
        pass

    elapsed = int((time.monotonic() - start) * 1000)
    log_event(
        logger, 20, "memory.working.load",
        duration_ms=elapsed,
        moods=len(wm.recent_moods),
        countdowns=len(wm.upcoming_events),
        rants=len(wm.recent_rants),
    )
    return wm
