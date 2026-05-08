from .base import BaseSkill, SkillRouter
from .emotion_support import EmotionSupportSkill
from .mood_analyst import MoodAnalystSkill
from .date_planner import DatePlannerSkill
from .memory_keeper import MemoryKeeperSkill
from .gift_advisor import GiftAdvisorSkill

ALL_SKILLS = [
    EmotionSupportSkill(),
    MoodAnalystSkill(),
    DatePlannerSkill(),
    MemoryKeeperSkill(),
    GiftAdvisorSkill(),
]

skill_router = SkillRouter(ALL_SKILLS)

__all__ = ["skill_router", "ALL_SKILLS", "BaseSkill", "SkillRouter"]
