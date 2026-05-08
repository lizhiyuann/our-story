"""礼物建议技能：基于用户偏好推荐礼物。"""

from .base import BaseSkill

_GIFT_KEYWORDS = [
    "礼物", "送什么", "生日", "节日", "惊喜", "情人节", "圣诞",
    "纪念日礼物", "想要什么", "买什么", "送她", "送你",
]


class GiftAdvisorSkill(BaseSkill):
    """礼物建议技能：当用户提到礼物、生日、节日准备时激活。"""

    name = "gift_advisor"
    description = "基于用户偏好推荐合适的礼物"

    @property
    def prompt(self) -> str:
        return """礼物建议：
1. 搜索用户偏好和过去送过的礼物
2. 查看即将到来的倒计时
3. 根据她的兴趣爱好给出 2-3 个具体建议
4. 如果用户喜欢某个建议，记住这个偏好"""

    @property
    def tools(self) -> list[str]:
        return ["get_user_preferences", "get_countdowns", "search_memory", "update_user_preference"]

    def score_match(self, message: str, context: dict) -> float:
        """匹配逻辑：消息中包含礼物相关关键词时触发。"""
        score = 0.0
        for kw in _GIFT_KEYWORDS:
            if kw in message:
                score += 0.25
        return min(score, 1.0)
