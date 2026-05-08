"""心情分析技能：追踪和分析情绪模式与规律。"""

from .base import BaseSkill

_MOOD_KEYWORDS = [
    "心情", "情绪", "最近怎么样", "状态", "开心吗", "难过吗",
    "我最近", "这几天", "感觉", "怎么样",
]


class MoodAnalystSkill(BaseSkill):
    """心情分析技能：当用户询问心情状态或情绪模式时激活。"""

    name = "mood_analyst"
    description = "分析心情模式和情绪规律"

    @property
    def prompt(self) -> str:
        return """分析用户的心情模式：
1. 获取最近的心情记录
2. 搜索过去的情绪模式记忆
3. 找出规律（工作日 vs 周末，特定事件后等）
4. 用温暖的语气给出分析和建议
5. 不要太长，2-3 句话即可"""

    @property
    def tools(self) -> list[str]:
        return ["get_recent_moods", "search_memory"]

    def score_match(self, message: str, context: dict) -> float:
        """匹配逻辑：消息中包含心情相关关键词时触发。"""
        score = 0.0
        for kw in _MOOD_KEYWORDS:
            if kw in message:
                score += 0.25
        return min(score, 1.0)
