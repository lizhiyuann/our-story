"""Base skill class and skill router."""

from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from logger import get_logger, log_event

logger = get_logger("skills")


class BaseSkill(ABC):
    """A modular capability of the agent."""

    @property
    @abstractmethod
    def name(self) -> str: ...

    @property
    @abstractmethod
    def description(self) -> str:
        """One-line description used for routing decisions."""

    @property
    @abstractmethod
    def prompt(self) -> str:
        """System prompt fragment injected when this skill is active."""

    @property
    def tools(self) -> list[str]:
        """Tool names this skill is allowed to use. Empty = all tools."""
        return []

    def score_match(self, message: str, context: dict) -> float:
        """How well this skill matches the current message (0.0-1.0)."""
        return 0.0


@dataclass
class SkillRouter:
    """Selects the best skill for a given message."""

    skills: list[BaseSkill] = field(default_factory=list)

    def route(self, message: str, context: dict) -> BaseSkill | None:
        """Return the best-matching skill, or None for default behavior."""
        best_skill = None
        best_score = 0.0

        for skill in self.skills:
            score = skill.score_match(message, context)
            if score > best_score:
                best_score = score
                best_skill = skill

        if best_skill and best_score >= 0.5:
            log_event(
                logger, 20, "skill.selected",
                skill=best_skill.name,
                score=round(best_score, 2),
                message_preview=message[:50],
            )
            return best_skill

        log_event(logger, 20, "skill.selected", skill="default", score=0, message_preview=message[:50])
        return None
