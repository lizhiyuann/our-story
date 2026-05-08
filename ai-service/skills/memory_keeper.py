"""Memory keeper skill: record and recall important moments."""

from .base import BaseSkill

MEMORY_KEYWORDS = ["记住", "纪念", "第一次", "重要", "特别", "里程碑", "今天"]


class MemoryKeeperSkill(BaseSkill):
    name = "memory_keeper"
    description = "Records important moments and recalls related memories"

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
        score = 0.0
        for kw in MEMORY_KEYWORDS:
            if kw in message:
                score += 0.2
        return min(score, 1.0)
