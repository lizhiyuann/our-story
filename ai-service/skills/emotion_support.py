"""情绪支持技能：检测负面情绪，提供共情安慰和情感支持。"""

from .base import BaseSkill

# 负面情绪关键词（部分匹配即可触发）
_NEGATIVE_KEYWORDS = [
    "难过", "伤心", "哭", "生气", "烦", "累", "焦虑", "压力",
    "害怕", "孤独", "委屈", "崩溃", "失落", "郁闷", "不开心",
    "难受", "烦死了", "好累", "心烦", "不爽", "讨厌", "痛苦",
]

# 正面情绪关键词（用于排除误触发）
_POSITIVE_KEYWORDS = ["开心", "高兴", "快乐", "幸福", "兴奋", "感动", "太好了"]


class EmotionSupportSkill(BaseSkill):
    """情绪支持技能：当检测到负面情绪时激活，提供共情安慰。"""

    name = "emotion_support"
    description = "检测负面情绪，提供共情安慰和情感支持"

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
        """
        匹配逻辑：
        1. 消息中包含负面情绪关键词 → 每个 +0.2 分
        2. 最近心情记录中有负面情绪 → +0.15 分
        3. 消息中包含正面关键词 → -0.3 分（避免误触发）
        """
        score = 0.0
        for kw in _NEGATIVE_KEYWORDS:
            if kw in message:
                score += 0.2
        recent_moods = context.get("recent_moods", [])
        if any(m.get("moodType") in ("sad", "angry") for m in recent_moods[:3]):
            score += 0.15
        for kw in _POSITIVE_KEYWORDS:
            if kw in message:
                score -= 0.3
        return max(0.0, min(score, 1.0))
