"""Emotion support skill: comfort, empathize, and support."""

from .base import BaseSkill

NEGATIVE_KEYWORDS = ["难过", "伤心", "哭", "生气", "烦", "累", "焦虑", "压力", "害怕", "孤独", "委屈", "崩溃", "失落", "郁闷"]
POSITIVE_KEYWORDS = ["开心", "高兴", "快乐", "幸福", "兴奋", "感动"]


class EmotionSupportSkill(BaseSkill):
    name = "emotion_support"
    description = "Detects negative emotions and provides comfort and support"

    @property
    def prompt(self) -> str:
        return """你现在需要提供情绪支持。规则：
1. 先搜索过去的记忆，了解是否有相关的背景
2. 共情她的感受，不要急于解决问题或给建议
3. 如果有相关的过去经历，引用它来安慰她
4. 用温暖的身体语言词汇（抱抱、摸摸头等）
5. 这次情绪事件要保存到长期记忆"""

    @property
    def tools(self) -> list[str]:
        return ["search_memory", "save_memory", "get_recent_moods"]

    def score_match(self, message: str, context: dict) -> float:
        score = 0.0
        for kw in NEGATIVE_KEYWORDS:
            if kw in message:
                score += 0.25
        # Boost if recent moods are also negative
        recent_moods = context.get("recent_moods", [])
        if any(m.get("moodType") in ("sad", "angry") for m in recent_moods[:3]):
            score += 0.15
        return min(score, 1.0)
