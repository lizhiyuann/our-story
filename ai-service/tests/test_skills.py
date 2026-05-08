"""Tests for skill routing and scoring."""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from skills.emotion_support import EmotionSupportSkill
from skills.mood_analyst import MoodAnalystSkill
from skills.date_planner import DatePlannerSkill
from skills.memory_keeper import MemoryKeeperSkill
from skills.gift_advisor import GiftAdvisorSkill
from skills.base import SkillRouter


class TestEmotionSupportSkill:
    def setup_method(self):
        self.skill = EmotionSupportSkill()

    def test_name(self):
        assert self.skill.name == "emotion_support"

    def test_detects_negative_emotion(self):
        score = self.skill.score_match("我今天好难过啊", {})
        assert score >= 0.5

    def test_low_score_for_neutral(self):
        score = self.skill.score_match("今天天气不错", {})
        assert score < 0.3

    def test_detects_multiple_negative_keywords(self):
        score = self.skill.score_match("我好难过又好焦虑", {})
        assert score >= 0.5

    def test_has_tools(self):
        assert "search_memory" in self.skill.tools
        assert "save_memory" in self.skill.tools


class TestDatePlannerSkill:
    def setup_method(self):
        self.skill = DatePlannerSkill()

    def test_detects_date_keyword(self):
        score = self.skill.score_match("周末我们出去玩吧", {})
        assert score >= 0.5

    def test_detects_food_keyword(self):
        score = self.skill.score_match("我们吃什么", {})
        assert score >= 0.25


class TestGiftAdvisorSkill:
    def setup_method(self):
        self.skill = GiftAdvisorSkill()

    def test_detects_gift_keyword(self):
        score = self.skill.score_match("你生日想要什么礼物", {})
        assert score >= 0.5


class TestMemoryKeeperSkill:
    def setup_method(self):
        self.skill = MemoryKeeperSkill()

    def test_detects_memory_keyword(self):
        score = self.skill.score_match("记住今天是我们第一次约会", {})
        assert score >= 0.4


class TestSkillRouter:
    def setup_method(self):
        self.router = SkillRouter([
            EmotionSupportSkill(),
            MoodAnalystSkill(),
            DatePlannerSkill(),
            MemoryKeeperSkill(),
            GiftAdvisorSkill(),
        ])

    def test_routes_to_emotion_support(self):
        skill = self.router.route("我今天好难过", {})
        assert skill is not None
        assert skill.name == "emotion_support"

    def test_routes_to_date_planner(self):
        skill = self.router.route("周末出去玩吧", {})
        assert skill is not None
        assert skill.name == "date_planner"

    def test_routes_to_gift_advisor(self):
        skill = self.router.route("生日送什么礼物好", {})
        assert skill is not None
        assert skill.name == "gift_advisor"

    def test_returns_none_for_generic(self):
        skill = self.router.route("你好", {})
        assert skill is None
