"""LangGraph agent assembly."""

from __future__ import annotations
import time
from langgraph.graph import StateGraph, START, END
from langchain_anthropic import ChatAnthropic

from logger import get_logger, log_event, request_id_var, user_id_var
from config import cfg
from .state import AgentState
from . import nodes
from memory import ShortTermMemory, LongTermMemory, load_working_memory
from tools import ALL_TOOLS, TOOL_MAP
from tools import memory_tools, mood_tools, countdown_tools, timeline_tools, preference_tools
from skills import ALL_SKILLS
from evolution import ConversationTracker, PreferenceLearner, PersonalityAdapter

logger = get_logger("agent.graph")


class LoveAgent:
    """The main agent that orchestrates everything."""

    def __init__(self):
        self.llm = ChatAnthropic(
            model=cfg.model,
            anthropic_api_key=cfg.anthropic_api_key,
            max_tokens=cfg.max_tokens,
        )
        self.long_term = LongTermMemory(persist_dir=cfg.chroma_persist_dir)
        self.short_term = ShortTermMemory(window_size=cfg.short_term_window)
        self.personality = PersonalityAdapter()
        self.tracker = ConversationTracker()
        self.pref_learner = PreferenceLearner(self.long_term)
        self.graph = self._build_graph()

        log_event(logger, 20, "agent.initialized", model=cfg.model, skills=len(ALL_SKILLS), tools=len(ALL_TOOLS))

    def _build_graph(self):
        deps = {
            "llm": self.llm,
            "long_term": self.long_term,
            "short_term": self.short_term,
            "personality": self.personality,
            "tracker": self.tracker,
            "pref_learner": self.pref_learner,
            "all_tools": ALL_TOOLS,
            "tool_map": TOOL_MAP,
            "skills": ALL_SKILLS,
            "load_working_memory": load_working_memory,
        }

        async def load_context_node(state: AgentState) -> dict:
            from tools.base import ApiClient
            api = ApiClient(cfg.api_base_url, state["user_id"])
            deps["api"] = api
            # Set tool context
            memory_tools.set_context(self.long_term, api)
            mood_tools.set_context(api)
            countdown_tools.set_context(api)
            timeline_tools.set_context(api)
            preference_tools.set_context(self.long_term, api)
            return await nodes.load_context(state, deps)

        async def think_node(state: AgentState) -> dict:
            return await nodes.think(state, deps)

        async def execute_tools_node(state: AgentState) -> dict:
            return await nodes.execute_tools(state, deps)

        async def reflect_node(state: AgentState) -> dict:
            return await nodes.reflect(state, deps)

        async def evolve_node(state: AgentState) -> dict:
            return await nodes.evolve(state, deps)

        g = StateGraph(AgentState)
        g.add_node("load_context", load_context_node)
        g.add_node("route_skill", nodes.route_skill)
        g.add_node("think", think_node)
        g.add_node("execute_tools", execute_tools_node)
        g.add_node("reflect", reflect_node)
        g.add_node("evolve", evolve_node)

        g.add_edge(START, "load_context")
        g.add_edge("load_context", "route_skill")
        g.add_edge("route_skill", "think")
        g.add_conditional_edges("think", nodes.should_continue_tools, {
            "think": "execute_tools",
            "reflect": "reflect",
        })
        g.add_edge("execute_tools", "think")
        g.add_edge("reflect", "evolve")
        g.add_edge("evolve", END)

        return g.compile()

    async def chat(self, request_id: str, user_id: int, message: str) -> str:
        """Process a user message and return the agent's reply."""
        request_id_var.set(request_id)
        user_id_var.set(user_id)

        log_event(logger, 20, "agent.request.start", request_id=request_id, user_id=user_id)
        start = time.monotonic()

        # Add to short-term memory
        self.short_term.add_message(user_id, "user", message)

        # Get conversation history
        messages = self.short_term.get_messages(user_id)

        initial_state: AgentState = {
            "user_id": user_id,
            "user_message": message,
            "messages": messages,
            "working_memory": None,  # type: ignore
            "active_skill": None,
            "skill_prompt": "",
            "llm_output": "",
            "tool_calls": [],
            "reply": "",
            "personality_params": {},
            "tools_used": [],
            "think_turn": 0,
        }

        try:
            result = await self.graph.ainvoke(initial_state)
            reply = result.get("reply", "") or "嗯嗯，我在听呢~ 💕"
        except Exception as exc:
            log_event(logger, 40, "agent.request.error", error=str(exc))
            reply = self._fallback(message)

        # Save to short-term memory
        self.short_term.add_message(user_id, "assistant", reply)
        await self.short_term.maybe_summarize(user_id, self.llm)

        elapsed = int((time.monotonic() - start) * 1000)
        log_event(
            logger, 20, "agent.request.done",
            request_id=request_id,
            total_duration_ms=elapsed,
            reply_length=len(reply),
        )
        return reply

    def _fallback(self, message: str) -> str:
        import random
        defaults = ["嗯嗯，我在听呢~ 💕", "我在呢！随时都在~", "好的好的！还有什么想说的吗？"]
        return random.choice(defaults)


# Singleton
_agent: LoveAgent | None = None


def get_agent() -> LoveAgent:
    global _agent
    if _agent is None:
        _agent = LoveAgent()
    return _agent
