"""技能基类和技能路由器：定义技能接口，根据消息语义选择最佳技能。"""

from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from logger import get_logger, log_event

logger = get_logger("skills")


class BaseSkill(ABC):
    """
    技能基类：Agent 的模块化能力单元。

    每个技能定义：
        - name:     技能唯一标识
        - description: 一句话描述（用于路由决策）
        - prompt:   技能激活时注入系统提示词的专属指令
        - tools:    该技能允许使用的工具列表（空=全部可用）
        - score_match(): 根据消息和上下文计算匹配分数（0.0-1.0）
    """

    @property
    @abstractmethod
    def name(self) -> str: ...

    @property
    @abstractmethod
    def description(self) -> str:
        """一句话描述，用于路由决策。"""

    @property
    @abstractmethod
    def prompt(self) -> str:
        """技能激活时注入系统提示词的专属行为指令。"""

    @property
    def tools(self) -> list[str]:
        """该技能允许使用的工具名称列表。空列表表示全部工具可用。"""
        return []

    def score_match(self, message: str, context: dict) -> float:
        """
        计算当前消息与该技能的匹配度。

        参数：
            message: 用户消息文本
            context: 上下文信息，包含 recent_moods、upcoming_events 等

        返回：
            匹配分数（0.0-1.0），>= 0.5 时触发该技能
        """
        return 0.0


@dataclass
class SkillRouter:
    """
    技能路由器：根据消息内容和上下文选择最匹配的技能。

    属性：
        skills: 已注册的技能列表

    路由逻辑：
        1. 遍历所有技能，调用 score_match() 计算匹配度
        2. 选择分数最高的技能
        3. 分数 >= 阈值时激活该技能，否则使用默认行为
    """

    skills: list[BaseSkill] = field(default_factory=list)
    threshold: float = 0.35  # 匹配阈值，越低越容易触发技能

    def route(self, message: str, context: dict) -> BaseSkill | None:
        """
        为给定消息选择最佳匹配的技能。

        参数：
            message: 用户消息文本
            context: 上下文信息（心情、倒计时等）

        返回：
            匹配度最高的技能实例，无匹配时返回 None（使用默认行为）
        """
        best_skill = None
        best_score = 0.0

        # 收集所有技能的匹配分数
        scores = []
        for skill in self.skills:
            score = skill.score_match(message, context)
            scores.append((skill.name, score))
            if score > best_score:
                best_score = score
                best_skill = skill

        if best_skill and best_score >= self.threshold:
            log_event(
                logger, 20, "skill.selected",
                技能=best_skill.name,
                分数=round(best_score, 2),
                所有分数={s[0]: round(s[1], 2) for s in scores},
                消息预览=message[:50],
            )
            return best_skill

        log_event(logger, 20, "skill.selected", 技能="默认", 分数=0, 消息预览=message[:50])
        return None
