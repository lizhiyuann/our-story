"""用户偏好学习：从对话中自动提取偏好信息。"""

from __future__ import annotations
from memory.models import MemoryEntry
from logger import get_logger, log_event

logger = get_logger("evolution.preferences")

# 偏好提取的关键词模式
# 格式：关键词 → 偏好类型
_PREFERENCE_PATTERNS = {
    "喜欢": "likes",
    "爱": "loves",
    "讨厌": "dislikes",
    "不喜欢": "dislikes",
    "最爱": "favorite",
    "偏好": "preference",
}


class PreferenceLearner:
    """
    用户偏好学习器，从对话中自动提取偏好并保存到长期记忆。

    属性：
        _ltm: LongTermMemory 实例，用于保存提取的偏好
    """

    def __init__(self, long_term_memory):
        self._ltm = long_term_memory

    async def extract_from_message(self, user_id: int, message: str) -> list[dict]:
        """
        从单条消息中提取偏好信息。

        参数：
            user_id: 用户 ID
            message: 用户消息文本

        返回：
            提取到的偏好列表，每条包含 type（偏好类型）和 context（上下文）

        关键逻辑：
            扫描消息中的偏好关键词（喜欢/讨厌/最爱等），
            提取关键词前后的文本作为偏好上下文。
        """
        found = []
        for keyword, pref_type in _PREFERENCE_PATTERNS.items():
            if keyword in message:
                idx = message.index(keyword)
                context = message[max(0, idx - 5):idx + 30].strip()
                found.append({
                    "type": pref_type,
                    "context": context,
                    "raw": message,
                })
        return found

    async def learn(self, user_id: int, message: str) -> list[str]:
        """
        从消息中提取偏好并保存到长期记忆。

        参数：
            user_id: 用户 ID
            message: 用户消息

        返回：
            已保存的偏好类型列表
        """
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
                用户ID=user_id, 偏好类型=pref["type"], 上下文=pref["context"][:40],
            )
        return saved
