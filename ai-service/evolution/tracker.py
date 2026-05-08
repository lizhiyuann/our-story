"""对话质量追踪：记录交互指标，评估对话效果。"""

from __future__ import annotations
from logger import get_logger, log_event

logger = get_logger("evolution.tracker")


class ConversationTracker:
    """
    对话质量追踪器，记录每次交互的指标。

    追踪指标：
        - 用户消息长度（长消息 = 高投入）
        - 助手回复长度
        - 使用的工具和技能
        - 对话轮次

    属性：
        _metrics: 用户交互历史 {user_id: [entries]}
    """

    def __init__(self):
        self._metrics: dict[int, list[dict]] = {}

    def record(
        self,
        user_id: int,
        user_message: str,
        agent_reply: str,
        tools_used: list[str],
        skill_used: str | None,
    ) -> None:
        """
        记录一次交互的指标。

        参数：
            user_id:      用户 ID
            user_message: 用户消息
            agent_reply:  助手回复
            tools_used:   本次使用的工具列表
            skill_used:   本次激活的技能名称
        """
        if user_id not in self._metrics:
            self._metrics[user_id] = []

        entry = {
            "用户消息长度": len(user_message),
            "助手回复长度": len(agent_reply),
            "使用的工具": tools_used,
            "激活的技能": skill_used,
            "消息预览": user_message[:40],
        }
        self._metrics[user_id].append(entry)

        # 只保留最近 100 条
        if len(self._metrics[user_id]) > 100:
            self._metrics[user_id] = self._metrics[user_id][-100:]

        log_event(
            logger, 20, "evolution.tracker.record",
            用户ID=user_id,
            消息长度=len(user_message),
            回复长度=len(agent_reply),
            工具=tools_used,
            技能=skill_used,
        )

    def get_quality_score(self, user_id: int) -> float:
        """
        计算用户的对话质量分数。

        参数：
            user_id: 用户 ID

        返回：
            质量分数（0.0-1.0），基于用户投入度和工具使用率

        算法：
            质量 = 平均消息长度/100 * 0.5 + 工具使用率 * 0.5
        """
        entries = self._metrics.get(user_id, [])
        if not entries:
            return 0.5

        recent = entries[-20:]
        avg_user_len = sum(e["用户消息长度"] for e in recent) / len(recent)
        tools_used_count = sum(1 for e in recent if e["使用的工具"])

        score = min(1.0, (avg_user_len / 100) * 0.5 + (tools_used_count / len(recent)) * 0.5)
        return round(score, 2)
