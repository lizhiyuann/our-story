"""LangGraph node implementations."""

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
    """Load working memory: moods, countdowns, rants, long-term memories."""
    log_event(logger, 20, "agent.load_context.start", user_id=state["user_id"])
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
        duration_ms=elapsed,
        moods=len(snapshot.recent_moods),
        countdowns=len(snapshot.upcoming_events),
    )
    return {"working_memory": snapshot, "personality_params": deps["personality"].get_params(state["user_id"])}


def route_skill(state: AgentState) -> dict:
    """Select the best skill for this message."""
    context = {
        "recent_moods": state["working_memory"].recent_moods,
        "upcoming_events": state["working_memory"].upcoming_events,
    }
    skill = skill_router.route(state["user_message"], context)
    if skill:
        return {"active_skill": skill.name, "skill_prompt": skill.prompt}
    return {"active_skill": None, "skill_prompt": ""}


async def think(state: AgentState, deps: dict) -> dict:
    """LLM reasoning: generate a reply, possibly with tool calls."""
    turn = state.get("think_turn", 0) + 1
    log_event(logger, 20, "agent.think.start", turn=turn)

    # Build system prompt
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

    # Build messages for LLM
    lc_messages = [{"role": "system", "content": system}]
    for m in state["messages"][-20:]:
        lc_messages.append({"role": m["role"], "content": m["content"]})
    lc_messages.append({"role": "user", "content": state["user_message"]})

    # Add tool results from previous turns
    tool_results = state.get("tool_calls", [])
    if tool_results:
        tool_summary = "\n\n工具调用结果：\n"
        for tr in tool_results:
            tool_summary += f"- {tr['name']}: {tr['result'][:200]}\n"
        lc_messages.append({"role": "user", "content": tool_summary.strip()})

    try:
        llm = deps["llm"]
        # Bind tools if available
        active_skill = state.get("active_skill")
        available_tools = deps["all_tools"]
        if active_skill:
            skill_obj = next((s for s in deps["skills"] if s.name == active_skill), None)
            if skill_obj and skill_obj.tools:
                available_tools = [t for t in deps["all_tools"] if t.name in skill_obj.tools]

        llm_with_tools = llm.bind_tools(available_tools) if available_tools else llm
        response = await llm_with_tools.ainvoke(lc_messages)

        # Check if LLM wants to call tools
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
                    tool=tc["name"], args=tc["args"],
                )
            return {"llm_output": response.content or "", "tool_calls": tool_calls_to_make, "think_turn": turn}

        # No tool calls → final reply
        reply = response.content or ""
        log_event(logger, 20, "agent.think.done", turn=turn, reply_length=len(reply))
        return {"reply": reply, "llm_output": reply, "tool_calls": [], "think_turn": turn}

    except Exception as exc:
        log_event(logger, 40, "agent.think.error", error=str(exc))
        return {"reply": "抱歉，我出了点小问题~ 稍后再试试？", "tool_calls": [], "think_turn": turn}


async def execute_tools(state: AgentState, deps: dict) -> dict:
    """Execute the tool calls requested by the LLM."""
    results = []
    tool_names = []
    tool_map = deps["tool_map"]

    for tc in state.get("tool_calls", []):
        name = tc["name"]
        args = tc["args"]
        start = time.monotonic()

        tool_fn = tool_map.get(name)
        if not tool_fn:
            result = f"Tool '{name}' not found"
        else:
            try:
                result = await tool_fn.ainvoke(args)
            except Exception as exc:
                result = f"Error: {exc}"
                log_event(logger, 40, "agent.tool.error", tool=name, error=str(exc))

        elapsed = int((time.monotonic() - start) * 1000)
        log_event(logger, 20, "agent.tool.done", tool=name, duration_ms=elapsed, result_preview=str(result)[:100])

        results.append({"name": name, "args": args, "result": str(result)})
        tool_names.append(name)

    return {"tool_calls": results, "tools_used": tool_names}


def should_continue_tools(state: AgentState) -> str:
    """Decide whether to loop back for more thinking or proceed to reflect."""
    if state.get("tool_calls") and not state.get("reply"):
        return "think"
    return "reflect"


async def reflect(state: AgentState, deps: dict) -> dict:
    """Evaluate the reply quality and decide if action is needed."""
    reply = state.get("reply", "")
    if not reply:
        return {"reply": "嗯嗯，我在听呢~ 💕"}

    # Track conversation quality
    deps["tracker"].record(
        user_id=state["user_id"],
        user_message=state["user_message"],
        agent_reply=reply,
        tools_used=state.get("tools_used", []),
        skill_used=state.get("active_skill"),
    )

    log_event(
        logger, 20, "agent.reflect.done",
        reply_length=len(reply),
        tools_used=state.get("tools_used", []),
    )
    return {}


async def evolve(state: AgentState, deps: dict) -> dict:
    """Run self-evolution: adapt personality, learn preferences."""
    user_id = state["user_id"]

    # Adapt personality
    changes = deps["personality"].adapt(
        user_id, state["user_message"], state.get("reply", "")
    )

    # Learn preferences from user message
    saved = await deps["pref_learner"].learn(user_id, state["user_message"])

    if changes or saved:
        log_event(
            logger, 20, "agent.evolve.done",
            personality_changes=changes,
            preferences_learned=saved,
        )
    return {}
