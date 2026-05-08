"""Tests for conversation tracker."""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from evolution.tracker import ConversationTracker


class TestConversationTracker:
    def setup_method(self):
        self.tracker = ConversationTracker()

    def test_record_creates_entry(self):
        self.tracker.record(
            user_id=1,
            user_message="你好",
            agent_reply="你好呀！",
            tools_used=[],
            skill_used=None,
        )
        score = self.tracker.get_quality_score(user_id=1)
        assert 0 <= score <= 1

    def test_quality_score_starts_at_half(self):
        assert self.tracker.get_quality_score(user_id=999) == 0.5

    def test_multiple_records(self):
        for i in range(5):
            self.tracker.record(
                user_id=1,
                user_message=f"消息{i}" * 10,
                agent_reply=f"回复{i}" * 5,
                tools_used=["search_memory"],
                skill_used="emotion_support",
            )
        score = self.tracker.get_quality_score(user_id=1)
        assert score > 0  # should have some positive score with tool usage
