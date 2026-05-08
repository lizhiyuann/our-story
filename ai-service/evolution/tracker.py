"""Conversation quality tracking for self-evolution."""

from __future__ import annotations
from logger import get_logger, log_event

logger = get_logger("evolution.tracker")


class ConversationTracker:
    """Tracks conversation quality metrics over time."""

    def __init__(self):
        # In-memory; production should persist
        self._metrics: dict[int, list[dict]] = {}

    def record(
        self,
        user_id: int,
        user_message: str,
        agent_reply: str,
        tools_used: list[str],
        skill_used: str | None,
    ) -> None:
        if user_id not in self._metrics:
            self._metrics[user_id] = []

        entry = {
            "user_msg_len": len(user_message),
            "agent_reply_len": len(agent_reply),
            "tools_used": tools_used,
            "skill_used": skill_used,
            "user_msg_preview": user_message[:40],
        }
        self._metrics[user_id].append(entry)

        # Keep only last 100 entries
        if len(self._metrics[user_id]) > 100:
            self._metrics[user_id] = self._metrics[user_id][-100:]

        log_event(
            logger, 20, "evolution.tracker.record",
            user_id=user_id,
            user_msg_len=len(user_message),
            agent_reply_len=len(agent_reply),
            tools=tools_used,
            skill=skill_used,
        )

    def get_quality_score(self, user_id: int) -> float:
        """Compute a quality score based on recent interactions."""
        entries = self._metrics.get(user_id, [])
        if not entries:
            return 0.5

        recent = entries[-20:]
        avg_user_len = sum(e["user_msg_len"] for e in recent) / len(recent)
        tools_used_count = sum(1 for e in recent if e["tools_used"])

        # Heuristic: longer user messages + tool usage = engaged conversation
        score = min(1.0, (avg_user_len / 100) * 0.5 + (tools_used_count / len(recent)) * 0.5)
        return round(score, 2)
