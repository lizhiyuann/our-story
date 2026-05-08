"""人格参数自适应：根据用户反馈动态调整 Agent 的人格特征。"""

from __future__ import annotations
from config import cfg
from logger import get_logger, log_event

logger = get_logger("evolution.personality")

# 人格参数默认值
DEFAULT_PARAMS = {
    "warmth": cfg.default_warmth,                # 温暖程度（0-1）
    "humor": cfg.default_humor,                  # 幽默程度
    "formality": cfg.default_formality,          # 正式程度（越低越亲密）
    "emoji_frequency": cfg.default_emoji_frequency,  # emoji 使用频率
    "response_length": cfg.default_response_length,  # 回复长度偏好（短 ↔ 长）
    "proactivity": cfg.default_proactivity,      # 主动关心程度
}


class PersonalityAdapter:
    """
    人格参数自适应器，根据对话反馈动态调整 Agent 的人格特征。

    调整信号：
        - 用户回复"哈哈哈" → 增加 humor
        - 用户回复很短 → 减少 response_length
        - 用户回复很长 → 增加 response_length
        - 用户说"谢谢/爱你" → 增加 warmth
        - 用户说"别发emoji" → 减少 emoji_frequency

    属性：
        _params: 每个用户的人格参数 {user_id: params_dict}
    """

    def __init__(self):
        self._params: dict[int, dict] = {}

    def get_params(self, user_id: int) -> dict:
        """获取指定用户的当前人格参数。"""
        if user_id not in self._params:
            self._params[user_id] = dict(DEFAULT_PARAMS)
        return dict(self._params[user_id])

    def adapt(self, user_id: int, user_message: str, agent_reply: str) -> dict:
        """
        根据本轮对话信号调整人格参数。

        参数：
            user_id:      用户 ID
            user_message: 用户消息（用于提取信号）
            agent_reply:  助手回复（预留，暂未使用）

        返回：
            本次调整的参数变化（如 {"humor": "+0.02"}）
        """
        params = self.get_params(user_id)
        changes = {}

        # 用户笑了 → 增加幽默
        if any(kw in user_message for kw in ["哈哈", "😂", "笑死", "太搞笑了"]):
            params["humor"] = min(1.0, params["humor"] + 0.02)
            changes["humor"] = "+0.02"

        # 用户回复很短 → 缩短回复
        if len(user_message) < 5:
            params["response_length"] = max(0.2, params["response_length"] - 0.02)
            changes["response_length"] = "-0.02"

        # 用户回复很长 → 可以适当详细
        if len(user_message) > 50:
            params["response_length"] = min(0.8, params["response_length"] + 0.01)
            changes["response_length"] = "+0.01"

        # 用户要求少发 emoji
        if "别发emoji" in user_message or "少发表情" in user_message:
            params["emoji_frequency"] = max(0.1, params["emoji_frequency"] - 0.1)
            changes["emoji_frequency"] = "-0.1"

        # 正面反馈 → 增加温暖
        if any(kw in user_message for kw in ["谢谢", "爱你", "么么", "感动"]):
            params["warmth"] = min(1.0, params["warmth"] + 0.01)
            changes["warmth"] = "+0.01"

        self._params[user_id] = params

        if changes:
            log_event(logger, 20, "evolution.personality.adapted", 用户ID=user_id, 变化=changes)

        return changes

    def format_for_prompt(self, user_id: int) -> str:
        """
        将人格参数格式化为提示词指令。

        参数：
            user_id: 用户 ID

        返回：
            人格指令文本（如"用非常温暖的语气；多用 emoji"）
        """
        p = self.get_params(user_id)
        parts = []
        if p["warmth"] > 0.7:
            parts.append("用非常温暖的语气")
        if p["humor"] > 0.7:
            parts.append("适当加入幽默元素")
        if p["emoji_frequency"] > 0.6:
            parts.append("多用 emoji 表达情感")
        elif p["emoji_frequency"] < 0.3:
            parts.append("少用 emoji")
        if p["response_length"] < 0.3:
            parts.append("回复要简短，1-2 句话")
        elif p["response_length"] > 0.7:
            parts.append("可以回复得详细一些")
        return "；".join(parts) if parts else "自然地回复"
