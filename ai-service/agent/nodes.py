"""LangGraph 图节点实现：加载上下文、技能路由、思考、工具执行、反思、进化。"""

from __future__ import annotations
import json
import time
from logger import get_logger, log_event
from .state import AgentState, WorkingMemorySnapshot
from .prompts import build_system_prompt
from skills import skill_router
from evolution import PersonalityAdapter

logger = get_logger("agent.nodes")


async def load_context(state: AgentState, deps: dict) -> dict:
    """
    加载工作记忆节点。

    从 Node.js API 拉取最近心情、倒计时、吐槽记录，
    从长期记忆中搜索相关上下文，组装成工作记忆快照。
    """
    log_event(logger, 20, "agent.load_context.start", 用户ID=state["user_id"])
    start = time.monotonic()

    wm = await deps["load_working_memory"](
        api=deps["api"],
        user_message=state["user_message"],
        long_term=deps["long_term"],
        short_term_summary=deps["short_term"].get_summary(state["user_id"]),
        personality_params=deps["personality"].get_params(state["user_id"]),
    )

    snapshot = WorkingMemorySnapshot(
        recent_moods=wm.recent_moods,
        upcoming_events=wm.upcoming_events,
        recent_rants=wm.recent_rants,
        user_preferences=wm.user_preferences,
        conversation_summary=wm.conversation_summary,
    )

    elapsed = int((time.monotonic() - start) * 1000)
    log_event(
        logger, 20, "agent.load_context.done",
        耗时ms=elapsed,
        心情数=len(snapshot.recent_moods),
        倒计时数=len(snapshot.upcoming_events),
    )
    return {"working_memory": snapshot, "personality_params": deps["personality"].get_params(state["user_id"])}


def route_skill(state: AgentState) -> dict:
    """技能路由节点：根据用户消息选择最匹配的技能模块。"""
    context = {
        "recent_moods": state["working_memory"].recent_moods,
        "upcoming_events": state["working_memory"].upcoming_events,
    }
    skill = skill_router.route(state["user_message"], context)
    if skill:
        return {"active_skill": skill.name, "skill_prompt": skill.prompt}
    return {"active_skill": None, "skill_prompt": ""}


async def think(state: AgentState, deps: dict) -> dict:
    """
    大模型推理节点。

    组装系统提示词（含人格、技能、记忆），调用大模型生成回复。
    如果大模型请求工具调用，则返回工具调用列表而非最终回复。
    """
    turn = state.get("think_turn", 0) + 1
    log_event(logger, 20, "agent.think.start", 轮次=turn)

    # 构建系统提示词
    wm = state["working_memory"]
    prefs_str = json.dumps(wm.user_preferences, ensure_ascii=False) if wm.user_preferences else "暂无"
    moods_str = ", ".join(
        f"{m.get('emoji', '?')}{m.get('content', '')[:20]}" for m in wm.recent_moods[:5]
    ) or "暂无"
    events_str = ", ".join(
        f"{e.get('icon', '?')}{e.get('title', '')}" for e in wm.upcoming_events[:5]
    ) or "暂无"

    personality_instr = deps["personality"].format_for_prompt(state["user_id"])

    system = build_system_prompt(
        personality_instructions=personality_instr,
        skill_name=state.get("active_skill"),
        skill_prompt=state.get("skill_prompt", ""),
        preferences=prefs_str,
        recent_moods=moods_str,
        upcoming_events=events_str,
        conversation_summary=wm.conversation_summary,
    )

    # 组装对话消息列表
    lc_messages = [{"role": "system", "content": system}]
    for m in state["messages"][-20:]:
        lc_messages.append({"role": m["role"], "content": m["content"]})
    lc_messages.append({"role": "user", "content": state["user_message"]})

    # 如果有上一轮工具调用结果，追加到消息中
    tool_results = state.get("tool_calls", [])
    if tool_results:
        tool_summary = "\n\n工具调用结果：\n"
        for tr in tool_results:
            tool_summary += f"- {tr['name']}: {tr['result'][:200]}\n"
        lc_messages.append({"role": "user", "content": tool_summary.strip()})

    try:
        llm = deps["llm"]

        # 根据当前技能过滤可用工具
        active_skill = state.get("active_skill")
        available_tools = deps["all_tools"]
        if active_skill:
            skill_obj = next((s for s in deps["skills"] if s.name == active_skill), None)
            if skill_obj and skill_obj.tools:
                available_tools = [t for t in deps["all_tools"] if t.name in skill_obj.tools]

        # 绑定工具并调用大模型
        llm_with_tools = llm.bind_tools(available_tools) if available_tools else llm
        response = await llm_with_tools.ainvoke(lc_messages)

        # 检查大模型是否请求工具调用
        if hasattr(response, "tool_calls") and response.tool_calls:
            tool_calls_to_make = []
            for tc in response.tool_calls:
                tool_calls_to_make.append({
                    "name": tc["name"],
                    "args": tc["args"],
                    "id": tc["id"],
                })
                log_event(
                    logger, 20, "agent.think.tool_call",
                    工具=tc["name"], 参数=tc["args"],
                )
            return {"llm_output": response.content or "", "tool_calls": tool_calls_to_make, "think_turn": turn}

        # 无工具调用 → 直接生成最终回复
        reply = response.content or ""
        log_event(logger, 20, "agent.think.done", 轮次=turn, 回复长度=len(reply))
        return {"reply": reply, "llm_output": reply, "tool_calls": [], "think_turn": turn}

    except Exception as exc:
        log_event(logger, 40, "agent.think.error", 错误=str(exc))
        return {"reply": "抱歉，我出了点小问题~ 稍后再试试？", "tool_calls": [], "think_turn": turn}


async def execute_tools(state: AgentState, deps: dict) -> dict:
    """工具执行节点：调用大模型请求的各个工具并收集结果。"""
    results = []
    tool_names = []
    tool_map = deps["tool_map"]

    for tc in state.get("tool_calls", []):
        name = tc["name"]
        args = tc["args"]
        start = time.monotonic()

        tool_fn = tool_map.get(name)
        if not tool_fn:
            result = f"工具 '{name}' 不存在"
        else:
            try:
                result = await tool_fn.ainvoke(args)
            except Exception as exc:
                result = f"执行出错: {exc}"
                log_event(logger, 40, "agent.tool.error", 工具=name, 错误=str(exc))

        elapsed = int((time.monotonic() - start) * 1000)
        log_event(logger, 20, "agent.tool.done", 工具=name, 耗时ms=elapsed, 结果预览=str(result)[:100])

        results.append({"name": name, "args": args, "result": str(result)})
        tool_names.append(name)

    return {"tool_calls": results, "tools_used": tool_names}


def should_continue_tools(state: AgentState) -> str:
    """
    条件路由：判断是否需要继续工具调用循环。

    有工具结果但无最终回复 → 回到思考节点
    已有最终回复 → 进入反思节点
    """
    if state.get("tool_calls") and not state.get("reply"):
        return "think"
    return "reflect"


async def reflect(state: AgentState, deps: dict) -> dict:
    """反思节点：评估回复质量，记录对话指标。"""
    reply = state.get("reply", "")
    if not reply:
        return {"reply": "嗯嗯，我在听呢~ 💕"}

    # 记录对话质量指标
    deps["tracker"].record(
        user_id=state["user_id"],
        user_message=state["user_message"],
        agent_reply=reply,
        tools_used=state.get("tools_used", []),
        skill_used=state.get("active_skill"),
    )

    log_event(
        logger, 20, "agent.reflect.done",
        回复长度=len(reply),
        使用工具=state.get("tools_used", []),
    )
    return {}


async def evolve(state: AgentState, deps: dict) -> dict:
    """自我进化节点：调整人格参数、学习用户偏好。"""
    user_id = state["user_id"]

    # 根据本轮对话调整人格参数
    changes = deps["personality"].adapt(
        user_id, state["user_message"], state.get("reply", "")
    )

    # 从用户消息中提取偏好信息
    saved = await deps["pref_learner"].learn(user_id, state["user_message"])

    if changes or saved:
        log_event(
            logger, 20, "agent.evolve.done",
            人格调整=changes,
            学到偏好=saved,
        )
    return {}
