"""Mood analyst skill: track and analyze mood patterns."""

from .base import BaseSkill

MOOD_QUERY_KEYWORDS = ["心情", "情绪", "最近怎么样", "状态", "开心吗", "难过吗"]


class MoodAnalystSkill(BaseSkill):
    name = "mood_analyst"
    description = "Analyzes mood patterns and provides insights"

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
        score = 0.0
        for kw in MOOD_QUERY_KEYWORDS:
            if kw in message:
                score += 0.3
        return min(score, 1.0)
