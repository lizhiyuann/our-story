"""记忆系统数据模型定义。"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Literal

MemoryType = Literal["conversation", "preference", "event", "emotion_pattern"]


@dataclass
class MemoryEntry:
    content: str
    memory_type: MemoryType
    importance: float = 0.5  # 0-1
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "content": self.content,
            "memory_type": self.memory_type,
            "importance": self.importance,
            "metadata": self.metadata,
        }
