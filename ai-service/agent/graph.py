"""
LangGraph agent assembly with multi-provider LLM support.

Supports: Anthropic, OpenAI, Xiaomi, DeepSeek, Qwen, Zhipu, Moonshot, Baidu
All providers use LangChain's unified ChatModel interface via langchain-openai
(OpenAI-compatible API) or langchain-anthropic.
"""

from __future__ import annotations
import time
import random
from langgraph.graph import StateGraph, START, END

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


def _create_llm():
    """
    Create a LangChain ChatModel based on the configured provider.

    Most providers expose OpenAI-compatible APIs, so we use ChatOpenAI.
    Anthropic uses ChatAnthropic.
    """
    provider = cfg.provider_name
    model = cfg.model
    api_key = cfg.api_key
    base_url = cfg.base_url
    max_tokens = cfg.max_tokens

    log_event(logger, 20, "agent.llm.init", provider=provider, model=model, base_url=base_url)

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=model,
            anthropic_api_key=api_key,
            max_tokens=max_tokens,
        )

    # All other providers use OpenAI-compatible API
    from langchain_openai import ChatOpenAI
    return ChatOpenAI(
        model=model,
        api_key=api_key,
        base_url=base_url,
        max_tokens=max_tokens,
    )


class LoveAgent:
    """The main agent that orchestrates memory, skills, tools, and evolution."""

    def __init__(self):
        self.llm = _create_llm()
        self.long_term = LongTermMemory(persist_dir=cfg.chroma_persist_dir)
        self.short_term = ShortTermMemory(window_size=cfg.short_term_window)
        self.personality = PersonalityAdapter()
        self.tracker = ConversationTracker()
        self.pref_learner = PreferenceLearner(self.long_term)
        self.graph = self._build_graph()

        log_event(
            logger, 20, "agent.initialized",
            provider=cfg.provider_name, model=cfg.model,
            skills=len(ALL_SKILLS), tools=len(ALL_TOOLS),
        )

    def _build_graph(self):
        """Assemble the LangGraph state machine."""
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
            """Load working memory: moods, countdowns, long-term memories."""
            from tools.base import ApiClient
            api = ApiClient(cfg.api_base_url, state["user_id"])
            deps["api"] = api
            memory_tools.set_context(self.long_term, api)
            mood_tools.set_context(api)
            countdown_tools.set_context(api)
            timeline_tools.set_context(api)
            preference_tools.set_context(self.long_term, api)
            return await nodes.load_context(state, deps)

        async def think_node(state: AgentState) -> dict:
            """LLM reasoning with optional tool calls."""
            return await nodes.think(state, deps)

        async def execute_tools_node(state: AgentState) -> dict:
            """Execute tool calls requested by the LLM."""
            return await nodes.execute_tools(state, deps)

        async def reflect_node(state: AgentState) -> dict:
            """Evaluate reply quality."""
            return await nodes.reflect(state, deps)

        async def evolve_node(state: AgentState) -> dict:
            """Self-evolution: learn preferences, adapt personality."""
            return await nodes.evolve(state, deps)

        # Build the graph
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
        """Process a user message through the full agent pipeline."""
        request_id_var.set(request_id)
        user_id_var.set(user_id)

        log_event(logger, 20, "agent.request.start", request_id=request_id, user_id=user_id)
        start = time.monotonic()

        # Add user message to short-term memory
        self.short_term.add_message(user_id, "user", message)
        messages = self.short_term.get_messages(user_id)

        # Build initial state
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
            reply = result.get("reply", "") or self._fallback(message)
        except Exception as exc:
            log_event(logger, 40, "agent.request.error", error=str(exc))
            reply = self._fallback(message)

        # Save assistant reply to short-term memory
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
        """Keyword-based fallback when LLM is unavailable."""
        fallbacks = cfg.fallback_responses
        for keyword, replies in fallbacks.items():
            if keyword in message:
                return random.choice(replies)
        return random.choice(cfg.default_replies)


# Singleton
_agent: LoveAgent | None = None


def get_agent() -> LoveAgent:
    """Get or create the agent singleton."""
    global _agent
    if _agent is None:
        _agent = LoveAgent()
    return _agent
