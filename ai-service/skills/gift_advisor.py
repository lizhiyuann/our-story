"""Gift advisor skill: suggest gifts based on preferences."""

from .base import BaseSkill

GIFT_KEYWORDS = ["礼物", "送什么", "生日", "节日", "惊喜", "情人节", "圣诞", "纪念日礼物"]


class GiftAdvisorSkill(BaseSkill):
    name = "gift_advisor"
    description = "Suggests gifts based on user preferences and upcoming events"

    @property
    def prompt(self) -> str:
        return """礼物建议：
1. 搜索用户偏好和过去送过的礼物
2. 查看即将到来的倒计时（生日、纪念日等）
3. 根据她的兴趣爱好给出 2-3 个具体建议
4. 如果用户喜欢某个建议，记住这个偏好"""

    @property
    def tools(self) -> list[str]:
        return ["get_user_preferences", "get_countdowns", "search_memory", "update_user_preference"]

    def score_match(self, message: str, context: dict) -> float:
        score = 0.0
        for kw in GIFT_KEYWORDS:
            if kw in message:
                score += 0.3
        return min(score, 1.0)
