"""Central configuration loaded from environment."""

import os
from dataclasses import dataclass, field
from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Config:
    # Server
    port: int = int(os.getenv("PORT", "8000"))

    # LLM
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    model: str = os.getenv("LLM_MODEL", "claude-sonnet-4-20250514")
    max_tokens: int = int(os.getenv("LLM_MAX_TOKENS", "600"))

    # Node.js backend
    api_base_url: str = os.getenv("API_BASE_URL", "http://server:3001")

    # ChromaDB
    chroma_persist_dir: str = os.getenv("CHROMA_PERSIST_DIR", "/app/chroma_data")

    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_format: str = os.getenv("LOG_FORMAT", "json")  # "json" or "text"

    # Personality defaults
    default_warmth: float = 0.8
    default_humor: float = 0.6
    default_formality: float = 0.2
    default_emoji_frequency: float = 0.7
    default_response_length: float = 0.5
    default_proactivity: float = 0.6

    # Memory
    short_term_window: int = 20
    long_term_max_results: int = 5

    @property
    def is_dev(self) -> bool:
        return self.log_format == "text"


cfg = Config()
