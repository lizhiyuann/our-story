"""Date planner skill: suggest activities and plan dates."""

from .base import BaseSkill

DATE_KEYWORDS = ["约会", "出去玩", "做什么", "周末", "无聊", "计划", "安排", "玩什么", "吃什么"]


class DatePlannerSkill(BaseSkill):
    name = "date_planner"
    description = "Suggests date activities and creates countdowns"

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
        score = 0.0
        for kw in DATE_KEYWORDS:
            if kw in message:
                score += 0.25
        return min(score, 1.0)
