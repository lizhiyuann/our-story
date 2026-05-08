"""Tests for memory data models."""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from memory.models import MemoryEntry


class TestMemoryEntry:
    def test_create_entry(self):
        entry = MemoryEntry(
            content="she likes sunflowers",
            memory_type="preference",
            importance=0.8,
        )
        assert entry.content == "she likes sunflowers"
        assert entry.memory_type == "preference"
        assert entry.importance == 0.8
        assert entry.metadata == {}

    def test_to_dict(self):
        entry = MemoryEntry(
            content="first date at cafe",
            memory_type="event",
            importance=0.9,
            metadata={"location": "cafe"},
        )
        d = entry.to_dict()
        assert d["content"] == "first date at cafe"
        assert d["memory_type"] == "event"
        assert d["importance"] == 0.9
        assert d["metadata"]["location"] == "cafe"

    def test_default_importance(self):
        entry = MemoryEntry(content="test", memory_type="conversation")
        assert entry.importance == 0.5
