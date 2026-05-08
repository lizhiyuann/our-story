"""Adaptive personality parameters that evolve based on interaction feedback."""

from __future__ import annotations
from config import cfg
from logger import get_logger, log_event

logger = get_logger("evolution.personality")

DEFAULT_PARAMS = {
    "warmth": cfg.default_warmth,
    "humor": cfg.default_humor,
    "formality": cfg.default_formality,
    "emoji_frequency": cfg.default_emoji_frequency,
    "response_length": cfg.default_response_length,
    "proactivity": cfg.default_proactivity,
}


class PersonalityAdapter:
    """Tracks and adapts personality parameters per user."""

    def __init__(self):
        self._params: dict[int, dict] = {}

    def get_params(self, user_id: int) -> dict:
        if user_id not in self._params:
            self._params[user_id] = dict(DEFAULT_PARAMS)
        return dict(self._params[user_id])

    def adapt(self, user_id: int, user_message: str, agent_reply: str) -> dict:
        """Adjust personality parameters based on interaction signals."""
        params = self.get_params(user_id)
        changes = {}

        # User replied with laughter → increase humor
        if any(kw in user_message for kw in ["哈哈", "😂", "笑死", "太搞笑了"]):
            params["humor"] = min(1.0, params["humor"] + 0.02)
            changes["humor"] = "+0.02"

        # User replied very briefly → reduce response length
        if len(user_message) < 5:
            params["response_length"] = max(0.2, params["response_length"] - 0.02)
            changes["response_length"] = "-0.02"

        # User replied at length → they're engaged, can be longer
        if len(user_message) > 50:
            params["response_length"] = min(0.8, params["response_length"] + 0.01)
            changes["response_length"] = "+0.01"

        # Emoji feedback
        if "别发emoji" in user_message or "少发表情" in user_message:
            params["emoji_frequency"] = max(0.1, params["emoji_frequency"] - 0.1)
            changes["emoji_frequency"] = "-0.1"

        # Thank you / positive feedback → warmth up
        if any(kw in user_message for kw in ["谢谢", "爱你", "么么", "感动"]):
            params["warmth"] = min(1.0, params["warmth"] + 0.01)
            changes["warmth"] = "+0.01"

        self._params[user_id] = params

        if changes:
            log_event(
                logger, 20, "evolution.personality.adapted",
                user_id=user_id, changes=changes,
            )

        return changes

    def format_for_prompt(self, user_id: int) -> str:
        """Format personality params as prompt instructions."""
        p = self.get_params(user_id)
        parts = []
        if p["warmth"] > 0.7:
            parts.append("用非常温暖的语气")
        if p["humor"] > 0.7:
            parts.append("适当加入幽默元素")
        if p["emoji_frequency"] > 0.6:
            parts.append("多用 emoji 表达情感")
        elif p["emoji_frequency"] < 0.3:
            parts.append("少用 emoji")
        if p["response_length"] < 0.3:
            parts.append("回复要简短，1-2 句话")
        elif p["response_length"] > 0.7:
            parts.append("可以回复得详细一些")
        return "；".join(parts) if parts else "自然地回复"
