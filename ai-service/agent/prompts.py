"""系统提示词模板：根据人格参数、技能、记忆动态组装最终提示词。"""

# 基础系统提示词，定义 Agent 的核心人格和行为规则
# 占位符：
#   {personality_instructions} - 人格自适应指令（如"用非常温暖的语气"）
#   {skill_section}            - 当前激活技能的专属指令
#   {memory_section}           - 工作记忆（偏好/心情/事件/摘要）
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

# 技能注入模板：当某个技能被激活时，将其专属指令注入系统提示词
# 占位符：
#   {skill_name}  - 技能名称（如"情绪支持"）
#   {skill_prompt} - 技能专属指令（如"先共情她的感受..."）
SKILL_SECTION_TEMPLATE = """
当前你正在使用「{skill_name}」技能：
{skill_prompt}"""

# 记忆注入模板：将工作记忆中的各个维度注入系统提示词
# 占位符：
#   {preferences}          - 用户偏好（如"喜欢向日葵"）
#   {recent_moods}         - 最近心情列表（如"😊开心, 😢难过"）
#   {upcoming_events}      - 即将到来的事件（如"🎂生日 12月31日"）
#   {conversation_summary} - 对话摘要（短期记忆生成的概括）
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
    """
    动态组装完整的系统提示词。

    将人格指令、当前技能说明、工作记忆（偏好/心情/事件/对话摘要）
    注入到基础提示词模板中，生成最终发送给大模型的 system prompt。

    参数：
        personality_instructions: 人格自适应指令，由 PersonalityAdapter 生成
        skill_name: 当前激活的技能名称，None 表示无特定技能
        skill_prompt: 当前技能的专属行为指令
        preferences: 用户偏好信息的文本摘要
        recent_moods: 最近心情的文本摘要
        upcoming_events: 即将到来的事件文本摘要
        conversation_summary: 短期记忆生成的对话摘要

    返回：
        完整的系统提示词字符串
    """
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
