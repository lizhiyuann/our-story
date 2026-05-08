"""约会规划技能：建议活动方案，创建倒计时。"""

from .base import BaseSkill

_DATE_KEYWORDS = [
    "约会", "出去玩", "做什么", "周末", "无聊", "计划", "安排",
    "玩什么", "吃什么", "去哪", "逛街", "看电影", "旅游",
]


class DatePlannerSkill(BaseSkill):
    """约会规划技能：当用户提到约会、出去玩、不知道做什么时激活。"""

    name = "date_planner"
    description = "建议约会活动和规划出行方案"

    @property
    def prompt(self) -> str:
        return """规划约会或活动：
1. 搜索用户偏好（喜欢什么类型的活动）
2. 查看即将到来的倒计时（是否有特别的日子）
3. 搜索过去的约会记忆（避免重复）
4. 给出 2-3 个具体建议
5. 如果用户同意，创建倒计时或记录到时间轴"""

    @property
    def tools(self) -> list[str]:
        return ["get_countdowns", "search_memory", "create_countdown", "get_user_preferences", "get_timeline"]

    def score_match(self, message: str, context: dict) -> float:
        """
        匹配逻辑：
        1. 关键词匹配 → 每个 +0.2 分
        2. 短消息 + 无聊信号 → +0.2 分
        """
        score = 0.0
        for kw in _DATE_KEYWORDS:
            if kw in message:
                score += 0.2
        if len(message) < 10 and any(kw in message for kw in ["无聊", "干嘛", "做什么"]):
            score += 0.2
        return min(score, 1.0)
