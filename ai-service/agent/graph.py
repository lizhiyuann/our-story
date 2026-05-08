"""
LangGraph Agent 主图组装，支持多厂商大模型。

支持厂商：Anthropic、OpenAI、小米、DeepSeek、通义千问、智谱、月之暗面、文心一言
除 Anthropic 使用 langchain-anthropic 外，其余均通过 langchain-openai（OpenAI 兼容协议）接入。
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
    根据配置的厂商创建 LangChain ChatModel 实例。

    Anthropic 厂商使用 ChatAnthropic，
    其余厂商均暴露 OpenAI 兼容 API，统一使用 ChatOpenAI。
    """
    provider = cfg.provider_name
    model = cfg.model
    api_key = cfg.api_key
    base_url = cfg.base_url
    max_tokens = cfg.max_tokens

    log_event(logger, 20, "agent.llm.init", 厂商=provider, 模型=model, 地址=base_url)

    if not api_key:
        log_event(logger, 30, "agent.llm.no_key", 厂商=provider)
        return None

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=model,
            anthropic_api_key=api_key,
            max_tokens=max_tokens,
        )

    # 其余厂商走 OpenAI 兼容协议
    from langchain_openai import ChatOpenAI
    return ChatOpenAI(
        model=model,
        api_key=api_key,
        base_url=base_url,
        max_tokens=max_tokens,
    )


class LoveAgent:
    """主 Agent 类，编排记忆、技能、工具和自我进化系统。"""

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
            厂商=cfg.provider_name, 模型=cfg.model,
            技能数=len(ALL_SKILLS), 工具数=len(ALL_TOOLS),
        )

    def _build_graph(self):
        """组装 LangGraph 状态机。"""
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
            """加载工作记忆：心情、倒计时、长期记忆。"""
            from tools.base import ApiClient
            api = ApiClient(cfg.api_base_url, state["user_id"])
            deps["api"] = api
            # 为各工具模块注入 API 客户端
            memory_tools.set_context(self.long_term, api)
            mood_tools.set_context(api)
            countdown_tools.set_context(api)
            timeline_tools.set_context(api)
            preference_tools.set_context(self.long_term, api)
            return await nodes.load_context(state, deps)

        async def think_node(state: AgentState) -> dict:
            """大模型推理：生成回复或请求工具调用。"""
            return await nodes.think(state, deps)

        async def execute_tools_node(state: AgentState) -> dict:
            """执行大模型请求的工具调用。"""
            return await nodes.execute_tools(state, deps)

        async def reflect_node(state: AgentState) -> dict:
            """反思：评估回复质量。"""
            return await nodes.reflect(state, deps)

        async def evolve_node(state: AgentState) -> dict:
            """自我进化：学习偏好、调整人格参数。"""
            return await nodes.evolve(state, deps)

        # 构建状态图
        g = StateGraph(AgentState)
        g.add_node("load_context", load_context_node)
        g.add_node("route_skill", nodes.route_skill)
        g.add_node("think", think_node)
        g.add_node("execute_tools", execute_tools_node)
        g.add_node("reflect", reflect_node)
        g.add_node("evolve", evolve_node)

        # 流程编排
        g.add_edge(START, "load_context")
        g.add_edge("load_context", "route_skill")
        g.add_edge("route_skill", "think")
        g.add_conditional_edges("think", nodes.should_continue_tools, {
            "think": "execute_tools",     # 有工具调用 → 执行工具
            "reflect": "reflect",          # 无工具调用 → 进入反思
        })
        g.add_edge("execute_tools", "think")  # 工具结果回到思考
        g.add_edge("reflect", "evolve")
        g.add_edge("evolve", END)

        return g.compile()

    async def chat(self, request_id: str, user_id: int, message: str) -> str:
        """处理用户消息，走完整个 Agent 流水线后返回回复。"""
        request_id_var.set(request_id)
        user_id_var.set(user_id)

        log_event(logger, 20, "agent.request.start", 请求ID=request_id, 用户ID=user_id)
        start = time.monotonic()

        # 将用户消息加入短期记忆
        self.short_term.add_message(user_id, "user", message)
        messages = self.short_term.get_messages(user_id)

        # 如果没有配置 LLM，直接使用关键词降级
        if not self.llm:
            log_event(logger, 20, "agent.request.fallback", 原因="无API Key")
            reply = self._fallback(message)
            self.short_term.add_message(user_id, "assistant", reply)
            elapsed = int((time.monotonic() - start) * 1000)
            log_event(logger, 20, "agent.request.done", 请求ID=request_id, 总耗时ms=elapsed, 回复长度=len(reply), 来源="fallback")
            return reply

        # 构建初始状态
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
            log_event(logger, 40, "agent.request.error", 错误=str(exc))
            reply = self._fallback(message)

        # 将助手回复加入短期记忆
        self.short_term.add_message(user_id, "assistant", reply)
        await self.short_term.maybe_summarize(user_id, self.llm)

        elapsed = int((time.monotonic() - start) * 1000)
        log_event(
            logger, 20, "agent.request.done",
            请求ID=request_id,
            总耗时ms=elapsed,
            回复长度=len(reply),
        )
        return reply

    async def chat_stream(self, request_id: str, user_id: int, message: str):
        """流式处理用户消息，逐块 yield 回复内容。"""
        request_id_var.set(request_id)
        user_id_var.set(user_id)

        log_event(logger, 20, "agent.stream.start", 请求ID=request_id, 用户ID=user_id)
        start = time.monotonic()

        self.short_term.add_message(user_id, "user", message)
        full_reply = ""

        # 无 LLM 时降级
        if not self.llm:
            reply = self._fallback(message)
            for char in reply:
                full_reply += char
                yield char
            self.short_term.add_message(user_id, "assistant", full_reply)
            return

        # 构建消息
        from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
        from .prompts import build_system_prompt

        messages = self.short_term.get_messages(user_id)
        personality = self.personality.format_for_prompt(user_id)

        system_prompt = build_system_prompt(personality_instructions=personality)
        lc_messages = [SystemMessage(content=system_prompt)]
        for m in messages:
            if m["role"] == "user":
                lc_messages.append(HumanMessage(content=m["content"]))
            else:
                lc_messages.append(AIMessage(content=m["content"]))

        # 流式调用 LLM
        try:
            async for chunk in self.llm.astream(lc_messages):
                if chunk.content:
                    full_reply += chunk.content
                    yield chunk.content
        except Exception as exc:
            log_event(logger, 40, "agent.stream.error", 错误=str(exc))
            fallback = self._fallback(message)
            for char in fallback:
                full_reply += char
                yield char

        # 保存到短期记忆
        self.short_term.add_message(user_id, "assistant", full_reply)
        elapsed = int((time.monotonic() - start) * 1000)
        log_event(logger, 20, "agent.stream.done", 请求ID=request_id, 总耗时ms=elapsed, 回复长度=len(full_reply))

    def _fallback(self, message: str) -> str:
        """无大模型时的关键词降级回复。"""
        fallbacks = cfg.fallback_responses
        for keyword, replies in fallbacks.items():
            if keyword in message:
                return random.choice(replies)
        return random.choice(cfg.default_replies)


# 全局单例
_agent: LoveAgent | None = None


def get_agent() -> LoveAgent:
    """获取或创建 Agent 单例。"""
    global _agent
    if _agent is None:
        _agent = LoveAgent()
    return _agent
