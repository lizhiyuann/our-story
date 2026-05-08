"""Learn user preferences from conversations."""

from __future__ import annotations
from memory.models import MemoryEntry
from logger import get_logger, log_event

logger = get_logger("evolution.preferences")

# Simple keyword-based extraction as fallback
PREFERENCE_PATTERNS = {
    "喜欢": "likes",
    "爱": "loves",
    "讨厌": "dislikes",
    "不喜欢": "dislikes",
    "最爱": "favorite",
    "偏好": "preference",
}


class PreferenceLearner:
    """Extracts and stores user preferences from conversation."""

    def __init__(self, long_term_memory):
        self._ltm = long_term_memory

    async def extract_from_message(self, user_id: int, message: str) -> list[dict]:
        """Extract preferences from a single user message using keyword matching."""
        found = []
        for keyword, pref_type in PREFERENCE_PATTERNS.items():
            if keyword in message:
                # Extract the part after the keyword
                idx = message.index(keyword)
                context = message[max(0, idx - 5):idx + 30].strip()
                found.append({
                    "type": pref_type,
                    "context": context,
                    "raw": message,
                })
        return found

    async def learn(self, user_id: int, message: str) -> list[str]:
        """Extract and save preferences from a message. Returns saved preference keys."""
        prefs = await self.extract_from_message(user_id, message)
        saved = []
        for pref in prefs:
            entry = MemoryEntry(
                content=pref["context"],
                memory_type="preference",
                importance=0.6,
                metadata={"type": pref["type"], "source": "auto_extract"},
            )
            await self._ltm.save(user_id, entry)
            saved.append(pref["type"])
            log_event(
                logger, 20, "evolution.preference.learned",
                user_id=user_id, pref_type=pref["type"], context=pref["context"][:40],
            )
        return saved
