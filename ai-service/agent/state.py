"""Agent state definition for LangGraph."""

from __future__ import annotations
from typing import TypedDict, Annotated
from dataclasses import dataclass, field
import operator


@dataclass
class WorkingMemorySnapshot:
    recent_moods: list[dict] = field(default_factory=list)
    upcoming_events: list[dict] = field(default_factory=list)
    recent_rants: list[dict] = field(default_factory=list)
    user_preferences: dict = field(default_factory=dict)
    conversation_summary: str = ""


class AgentState(TypedDict):
    # Input
    user_id: int
    user_message: str
    messages: list[dict]  # conversation history

    # Working memory (loaded at start)
    working_memory: WorkingMemorySnapshot

    # Skill routing
    active_skill: str | None
    skill_prompt: str

    # LLM reasoning
    llm_output: str
    tool_calls: list[dict]  # [{name, args, result}]
    reply: str

    # Evolution
    personality_params: dict
    tools_used: Annotated[list[str], operator.add]

    # Counters
    think_turn: int
