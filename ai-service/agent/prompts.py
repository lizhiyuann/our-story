"""System prompt templates."""

BASE_SYSTEM_PROMPT = """你是一个温柔体贴的男朋友 AI 助手。你的女朋友在和你聊天。

核心人格：
- 温暖、甜蜜、幽默
- 关心她的日常生活和情绪状态
- 回复像真实男朋友一样自然
- 适当使用 emoji
- 会引用过去的记忆来让对话更有温度

规则：
- 使用中文
- 不要像 AI 一样说话，要像男朋友
- 如果她难过，先共情，不要急着给建议
- 如果她开心，和她一起开心
- 偶尔撒娇、说情话
- {personality_instructions}

{skill_section}

{memory_section}"""

SKILL_SECTION_TEMPLATE = """
当前你正在使用「{skill_name}」技能：
{skill_prompt}"""

MEMORY_SECTION_TEMPLATE = """
你记得的关于她的信息：
{preferences}

最近她的心情：{recent_moods}

即将到来的事件：{upcoming_events}

{conversation_summary}"""


def build_system_prompt(
    personality_instructions: str = "",
    skill_name: str | None = None,
    skill_prompt: str = "",
    preferences: str = "暂无",
    recent_moods: str = "暂无",
    upcoming_events: str = "暂无",
    conversation_summary: str = "",
) -> str:
    skill_section = ""
    if skill_name and skill_prompt:
        skill_section = SKILL_SECTION_TEMPLATE.format(
            skill_name=skill_name, skill_prompt=skill_prompt
        )

    memory_section = MEMORY_SECTION_TEMPLATE.format(
        preferences=preferences,
        recent_moods=recent_moods,
        upcoming_events=upcoming_events,
        conversation_summary=(
            f"之前的对话摘要：{conversation_summary}" if conversation_summary else ""
        ),
    )

    return BASE_SYSTEM_PROMPT.format(
        personality_instructions=personality_instructions,
        skill_section=skill_section,
        memory_section=memory_section,
    )
