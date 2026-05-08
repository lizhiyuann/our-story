"""Tests for personality adapter."""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from evolution.personality import PersonalityAdapter, DEFAULT_PARAMS


class TestPersonalityAdapter:
    def setup_method(self):
        self.adapter = PersonalityAdapter()

    def test_default_params(self):
        params = self.adapter.get_params(user_id=1)
        assert params["warmth"] == DEFAULT_PARAMS["warmth"]
        assert params["humor"] == DEFAULT_PARAMS["humor"]

    def test_params_are_independent_per_user(self):
        p1 = self.adapter.get_params(user_id=1)
        p2 = self.adapter.get_params(user_id=2)
        assert p1 == p2  # same defaults
        # mutating one shouldn't affect the other
        self.adapter.adapt(user_id=1, user_message="哈哈哈哈", agent_reply="笑死")
        p1_after = self.adapter.get_params(user_id=1)
        p2_after = self.adapter.get_params(user_id=2)
        assert p1_after["humor"] > p2_after["humor"]

    def test_humor_increases_on_laughter(self):
        before = self.adapter.get_params(user_id=1)["humor"]
        self.adapter.adapt(user_id=1, user_message="哈哈哈哈太搞笑了", agent_reply="是吧")
        after = self.adapter.get_params(user_id=1)["humor"]
        assert after > before

    def test_response_length_decreases_on_short_reply(self):
        before = self.adapter.get_params(user_id=1)["response_length"]
        self.adapter.adapt(user_id=1, user_message="嗯", agent_reply="好的")
        after = self.adapter.get_params(user_id=1)["response_length"]
        assert after < before

    def test_warmth_increases_on_thanks(self):
        before = self.adapter.get_params(user_id=1)["warmth"]
        self.adapter.adapt(user_id=1, user_message="谢谢你宝贝", agent_reply="不客气")
        after = self.adapter.get_params(user_id=1)["warmth"]
        assert after > before

    def test_format_for_prompt(self):
        result = self.adapter.format_for_prompt(user_id=1)
        assert isinstance(result, str)
        assert len(result) > 0

    def test_adapt_returns_changes(self):
        changes = self.adapter.adapt(user_id=1, user_message="哈哈哈", agent_reply="笑")
        assert "humor" in changes
