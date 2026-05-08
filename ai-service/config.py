"""
集中配置模块：从 config/ai.json + 环境变量加载配置。

优先级：环境变量 > 配置文件 > 默认值。
"""

import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# 定位配置文件（兼容 Docker 和本地开发）
_CONFIG_DIR = Path(__file__).parent.parent / "config"
_AI_CONFIG_PATH = _CONFIG_DIR / "ai.json"


def _load_ai_config() -> dict:
    """加载并解析 config/ai.json 配置文件。"""
    if _AI_CONFIG_PATH.exists():
        with open(_AI_CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


_ai_cfg = _load_ai_config()


@dataclass(frozen=True)
class ProviderConfig:
    """大模型厂商配置。"""
    name: str           # 厂商名称（如 anthropic、xiaomi）
    env_key: str        # 对应的环境变量名（如 ANTHROPIC_API_KEY）
    base_url: str       # API 基础地址
    default_model: str  # 默认模型名称
    models: dict[str, dict]  # 可用模型列表


def _get_provider() -> tuple[str, ProviderConfig]:
    """
    解析当前激活的大模型厂商。

    优先从环境变量 LLM_PROVIDER 读取，
    否则使用 config/ai.json 中的 provider 字段。
    如果指定厂商没有 API Key，则自动选择第一个有 Key 的厂商。
    """
    provider_name = os.getenv("LLM_PROVIDER", _ai_cfg.get("provider", "anthropic"))
    providers_cfg = _ai_cfg.get("providers", {})

    # 如果指定厂商没有 Key，尝试自动降级
    if provider_name not in providers_cfg:
        for name, pcfg in providers_cfg.items():
            if os.getenv(pcfg.get("envKey", "")):
                provider_name = name
                break

    pcfg = providers_cfg.get(provider_name, {})
    api_key = os.getenv(pcfg.get("envKey", ""), "")

    provider = ProviderConfig(
        name=provider_name,
        env_key=pcfg.get("envKey", ""),
        base_url=pcfg.get("base_url", ""),
        default_model=pcfg.get("defaultModel", ""),
        models=pcfg.get("models", {}),
    )
    return api_key, provider


_api_key, _provider = _get_provider()


@dataclass(frozen=True)
class Config:
    """应用全局配置单例。"""

    # --- 服务端口 ---
    port: int = int(os.getenv("AI_SERVICE_PORT", "8000"))

    # --- 大模型厂商 ---
    provider_name: str = _provider.name        # 当前厂商名
    api_key: str = _api_key                    # API 密钥
    base_url: str = _provider.base_url         # API 地址
    model: str = os.getenv("LLM_MODEL", _provider.default_model)  # 模型名
    max_tokens: int = int(os.getenv("LLM_MAX_TOKENS", str(_ai_cfg.get("defaultMaxTokens", 600))))
    provider_models: dict[str, dict] = field(default_factory=lambda: _provider.models)  # 该厂商所有可用模型

    # --- Node.js 后端地址 ---
    api_base_url: str = os.getenv("API_BASE_URL", "http://server:3001")

    # --- ChromaDB 向量数据库 ---
    chroma_persist_dir: str = os.getenv("CHROMA_PERSIST_DIR", "/app/chroma_data")

    # --- 日志 ---
    log_level: str = os.getenv("LOG_LEVEL", "INFO")       # DEBUG / INFO / WARNING / ERROR
    log_format: str = os.getenv("LOG_FORMAT", "json")     # json=生产环境 / text=开发环境

    # --- 人格参数默认值（来自 config/ai.json）---
    default_warmth: float = _ai_cfg.get("personality", {}).get("defaults", {}).get("warmth", 0.8)
    default_humor: float = _ai_cfg.get("personality", {}).get("defaults", {}).get("humor", 0.6)
    default_formality: float = _ai_cfg.get("personality", {}).get("defaults", {}).get("formality", 0.2)
    default_emoji_frequency: float = _ai_cfg.get("personality", {}).get("defaults", {}).get("emojiFrequency", 0.7)
    default_response_length: float = _ai_cfg.get("personality", {}).get("defaults", {}).get("responseLength", 0.5)
    default_proactivity: float = _ai_cfg.get("personality", {}).get("defaults", {}).get("proactivity", 0.6)

    # --- 记忆系统（来自 config/ai.json）---
    short_term_window: int = _ai_cfg.get("memory", {}).get("shortTermWindow", 20)
    long_term_max_results: int = _ai_cfg.get("memory", {}).get("longTermMaxResults", 5)

    # --- 降级回复模板（来自 config/ai.json）---
    fallback_responses: dict[str, list[str]] = field(default_factory=lambda: _ai_cfg.get("fallbackResponses", {}))
    default_replies: list[str] = field(default_factory=lambda: _ai_cfg.get("defaultReplies", ["嗯嗯，我在听呢~ 💕"]))

    @property
    def is_dev(self) -> bool:
        """是否为开发环境（text 格式日志）。"""
        return self.log_format == "text"

    @property
    def has_api_key(self) -> bool:
        """是否配置了 API Key。"""
        return bool(self.api_key)


cfg = Config()
