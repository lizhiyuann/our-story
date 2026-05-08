"""AI Agent 的 FastAPI 服务入口。"""

import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel

from config import cfg
from logger import setup_logging, get_logger, log_event, request_id_var, user_id_var

setup_logging(level=cfg.log_level, json_format=not cfg.is_dev)
logger = get_logger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize agent on startup."""
    log_event(logger, 20, "app.startup", model=cfg.model, log_level=cfg.log_level)
    from agent import get_agent
    get_agent()
    yield
    log_event(logger, 20, "app.shutdown")


app = FastAPI(title="Love AI Agent", lifespan=lifespan)


class ChatRequest(BaseModel):
    message: str
    user_id: int
    history: list[dict] = []


class ChatResponse(BaseModel):
    reply: str
    request_id: str


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    rid = str(uuid.uuid4())[:8]
    request_id_var.set(rid)
    user_id_var.set(req.user_id)

    log_event(logger, 20, "api.chat.start", request_id=rid, user_id=req.user_id, msg_len=len(req.message))

    from agent import get_agent
    agent = get_agent()
    reply = await agent.chat(rid, req.user_id, req.message)

    log_event(logger, 20, "api.chat.done", request_id=rid, reply_len=len(reply))
    return ChatResponse(reply=reply, request_id=rid)


@app.get("/health")
async def health():
    return {"status": "ok", "model": cfg.model, "ai_enabled": bool(cfg.anthropic_api_key)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=cfg.port)
