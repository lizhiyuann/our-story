"""
Central configuration: loads from config/ai.json + environment variables.

Priority: env vars > config file > defaults.
"""

import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Locate config file (works in Docker and local dev)
_CONFIG_DIR = Path(__file__).parent.parent / "config"
_AI_CONFIG_PATH = _CONFIG_DIR / "ai.json"


def _load_ai_config() -> dict:
    """Load and parse config/ai.json."""
    if _AI_CONFIG_PATH.exists():
        with open(_AI_CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


_ai_cfg = _load_ai_config()


@dataclass(frozen=True)
class ProviderConfig:
    """LLM provider configuration."""
    name: str
    env_key: str
    base_url: str
    default_model: str
    models: dict[str, dict]


def _get_provider() -> tuple[str, ProviderConfig]:
    """Resolve the active LLM provider from env or config file."""
    provider_name = os.getenv("LLM_PROVIDER", _ai_cfg.get("provider", "anthropic"))
    providers_cfg = _ai_cfg.get("providers", {})

    if provider_name not in providers_cfg:
        # Fallback to first available provider with a key
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
    """Application-wide configuration singleton."""

    # --- Server ---
    port: int = int(os.getenv("PORT", "8000"))

    # --- LLM Provider ---
    provider_name: str = _provider.name
    api_key: str = _api_key
    base_url: str = _provider.base_url
    model: str = os.getenv("LLM_MODEL", _provider.default_model)
    max_tokens: int = int(os.getenv("LLM_MAX_TOKENS", str(_ai_cfg.get("defaultMaxTokens", 600))))
    provider_models: dict[str, dict] = _provider.models

    # --- Node.js backend ---
    api_base_url: str = os.getenv("API_BASE_URL", "http://server:3001")

    # --- ChromaDB ---
    chroma_persist_dir: str = os.getenv("CHROMA_PERSIST_DIR", "/app/chroma_data")

    # --- Logging ---
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_format: str = os.getenv("LOG_FORMAT", "json")  # "json" or "text"

    # --- Personality defaults (from config/ai.json) ---
    default_warmth: float = _ai_cfg.get("personality", {}).get("defaults", {}).get("warmth", 0.8)
    default_humor: float = _ai_cfg.get("personality", {}).get("defaults", {}).get("humor", 0.6)
    default_formality: float = _ai_cfg.get("personality", {}).get("defaults", {}).get("formality", 0.2)
    default_emoji_frequency: float = _ai_cfg.get("personality", {}).get("defaults", {}).get("emojiFrequency", 0.7)
    default_response_length: float = _ai_cfg.get("personality", {}).get("defaults", {}).get("responseLength", 0.5)
    default_proactivity: float = _ai_cfg.get("personality", {}).get("defaults", {}).get("proactivity", 0.6)

    # --- Memory (from config/ai.json) ---
    short_term_window: int = _ai_cfg.get("memory", {}).get("shortTermWindow", 20)
    long_term_max_results: int = _ai_cfg.get("memory", {}).get("longTermMaxResults", 5)

    # --- Fallback responses (from config/ai.json) ---
    fallback_responses: dict[str, list[str]] = _ai_cfg.get("fallbackResponses", {})
    default_replies: list[str] = _ai_cfg.get("defaultReplies", ["嗯嗯，我在听呢~ 💕"])

    @property
    def is_dev(self) -> bool:
        return self.log_format == "text"

    @property
    def has_api_key(self) -> bool:
        return bool(self.api_key)


cfg = Config()
