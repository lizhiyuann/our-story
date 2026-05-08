"""AI Agent 的 FastAPI 服务入口。"""

import uuid
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from config import cfg
from logger import setup_logging, get_logger, log_event, request_id_var, user_id_var

setup_logging(level=cfg.log_level, json_format=not cfg.is_dev)
logger = get_logger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log_event(logger, 20, "app.startup", model=cfg.model, log_level=cfg.log_level)
    from agent import get_agent
    get_agent()
    yield
    log_event(logger, 20, "app.shutdown")


app = FastAPI(title="Love AI Agent", lifespan=lifespan)


class ChatRequest(BaseModel):
    message: str
    user_id: int
    stream: bool = False


class ChatResponse(BaseModel):
    reply: str
    request_id: str


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """非流式聊天接口。"""
    rid = str(uuid.uuid4())[:8]
    request_id_var.set(rid)
    user_id_var.set(req.user_id)

    log_event(logger, 20, "api.chat.start", request_id=rid, user_id=req.user_id, msg_len=len(req.message))

    from agent import get_agent
    agent = get_agent()
    reply = await agent.chat(rid, req.user_id, req.message)

    log_event(logger, 20, "api.chat.done", request_id=rid, reply_len=len(reply))
    return ChatResponse(reply=reply, request_id=rid)


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    """流式聊天接口（SSE）。"""
    rid = str(uuid.uuid4())[:8]
    request_id_var.set(rid)
    user_id_var.set(req.user_id)

    log_event(logger, 20, "api.chat.stream.start", request_id=rid, user_id=req.user_id)

    from agent import get_agent
    agent = get_agent()

    async def event_generator():
        try:
            async for chunk in agent.chat_stream(rid, req.user_id, req.message):
                yield f"data: {json.dumps({'text': chunk, 'done': False}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'text': '', 'done': True})}\n\n"
        except Exception as exc:
            log_event(logger, 40, "api.chat.stream.error", error=str(exc))
            yield f"data: {json.dumps({'text': '', 'done': True, 'error': str(exc)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.delete("/chat/history/{user_id}")
async def clear_history(user_id: int):
    """清空用户聊天历史。"""
    from memory import ShortTermMemory
    from agent import get_agent
    agent = get_agent()
    agent.short_term.clear(user_id)
    log_event(logger, 20, "api.chat.history.cleared", user_id=user_id)
    return {"success": True}


@app.get("/health")
async def health():
    return {"status": "ok", "model": cfg.model, "ai_enabled": bool(cfg.api_key)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=cfg.port)
