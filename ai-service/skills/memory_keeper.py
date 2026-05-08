"""记忆守护技能：记录重要时刻，关联过去记忆。"""

from .base import BaseSkill

_MEMORY_KEYWORDS = [
    "记住", "纪念", "第一次", "重要", "特别", "里程碑", "今天",
    "永远", "不能忘", "刻", "日子", "历史性的",
]


class MemoryKeeperSkill(BaseSkill):
    """记忆守护技能：当用户分享重要事件或要求记住某事时激活。"""

    name = "memory_keeper"
    description = "记录重要时刻并关联过去的美好记忆"

    @property
    def prompt(self) -> str:
        return """记录重要时刻：
1. 将这个事件保存到长期记忆（importance 设高）
2. 同时记录到时间轴
3. 搜索是否有相关的过去记忆可以关联
4. 回复时引用过去的美好记忆，让对话更有温度"""

    @property
    def tools(self) -> list[str]:
        return ["save_memory", "record_event", "search_memory", "get_timeline"]

    def score_match(self, message: str, context: dict) -> float:
        """
        匹配逻辑：
        1. 关键词匹配 → 每个 +0.2 分
        2. 消息较长（用户在描述事件）→ +0.1 分
        """
        score = 0.0
        for kw in _MEMORY_KEYWORDS:
            if kw in message:
                score += 0.2
        if len(message) > 50:
            score += 0.1
        return min(score, 1.0)
