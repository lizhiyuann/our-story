"""结构化日志系统：JSON 格式，支持请求级链路追踪。"""

import json
import logging
import sys
from contextvars import ContextVar
from datetime import datetime, timezone

# Per-request context (propagated automatically in async)
request_id_var: ContextVar[str] = ContextVar("request_id", default="-")
user_id_var: ContextVar[int] = ContextVar("user_id", default=0)


class StructuredFormatter(logging.Formatter):
    """JSON formatter for production, coloured text for dev."""

    def __init__(self, json_mode: bool = True):
        super().__init__()
        self.json_mode = json_mode

    def format(self, record: logging.LogRecord) -> str:
        ts = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
        rid = request_id_var.get("-")
        uid = user_id_var.get(0)
        data = getattr(record, "extra_data", None)

        if self.json_mode:
            entry: dict = {
                "ts": ts,
                "level": record.levelname,
                "name": record.name,
                "msg": record.getMessage(),
                "rid": rid,
                "uid": uid,
            }
            if data:
                entry["data"] = data
            if record.exc_info and record.exc_info[1]:
                entry["exc"] = self.formatException(record.exc_info)
            return json.dumps(entry, ensure_ascii=False, default=str)

        # Text mode (dev)
        prefix = f"{ts} [{record.levelname:5s}] {record.name}"
        parts = [f"{prefix} | rid={rid} uid={uid} | {record.getMessage()}"]
        if data:
            parts.append(f" | {json.dumps(data, ensure_ascii=False, default=str)}")
        if record.exc_info and record.exc_info[1]:
            parts.append(f"\n{self.formatException(record.exc_info)}")
        return "".join(parts)


def setup_logging(level: str = "INFO", json_format: bool = True) -> None:
    root = logging.getLogger()
    root.setLevel(getattr(logging, level.upper(), logging.INFO))
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter(json_mode=json_format))
    root.handlers = [handler]


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


def log_event(
    logger: logging.Logger,
    level: int,
    event: str,
    **data,
) -> None:
    """Emit a structured log event with extra data fields."""
    record = logger.makeRecord(logger.name, level, "(agent)", 0, event, (), None)
    record.extra_data = data if data else None
    logger.handle(record)
