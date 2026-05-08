"""短期记忆：对话级上下文管理，支持自动摘要压缩。"""

from __future__ import annotations
from logger import get_logger, log_event

logger = get_logger("memory.short_term")


class ShortTermMemory:
    """Manages recent conversation context."""

    def __init__(self, window_size: int = 20):
        self._window_size = window_size
        # In-memory store; production should persist via Redis or DB
        self._conversations: dict[int, list[dict]] = {}
        self._summaries: dict[int, str] = {}

    def get_messages(self, user_id: int) -> list[dict]:
        return self._conversations.get(user_id, [])[-self._window_size:]

    def get_summary(self, user_id: int) -> str:
        return self._summaries.get(user_id, "")

    def add_message(self, user_id: int, role: str, content: str) -> None:
        if user_id not in self._conversations:
            self._conversations[user_id] = []
        self._conversations[user_id].append({"role": role, "content": content})
        # Trim old messages
        if len(self._conversations[user_id]) > self._window_size * 2:
            self._conversations[user_id] = self._conversations[user_id][-self._window_size:]

    def clear(self, user_id: int) -> None:
        """清空指定用户的对话历史和摘要。"""
        self._conversations.pop(user_id, None)
        self._summaries.pop(user_id, None)
        log_event(logger, 20, "memory.short_term.cleared", user_id=user_id)

    async def maybe_summarize(self, user_id: int, llm) -> None:
        """Summarize old messages if conversation is long."""
        msgs = self._conversations.get(user_id, [])
        if len(msgs) <= self._window_size:
            return

        old = msgs[: self._window_size]
        try:
            summary_prompt = (
                "用一句话概括以下对话的要点，保留关键信息和情绪：\n"
                + "\n".join(f"{m['role']}: {m['content']}" for m in old)
            )
            resp = await llm.ainvoke(summary_prompt)
            self._summaries[user_id] = resp.content
            log_event(logger, 20, "memory.short_term.summarized", user_id=user_id, old_count=len(old))
        except Exception as exc:
            log_event(logger, 30, "memory.short_term.summarize_failed", error=str(exc))
