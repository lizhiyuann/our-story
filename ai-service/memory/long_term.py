"""Long-term memory: ChromaDB vector store for semantic search."""

from __future__ import annotations
import time
import chromadb
from logger import get_logger, log_event
from .models import MemoryEntry

logger = get_logger("memory.long_term")


class LongTermMemory:
    """Semantic search over past conversations, preferences, and events."""

    def __init__(self, persist_dir: str = "/app/chroma_data"):
        self._client = chromadb.PersistentClient(path=persist_dir)
        self._collection = self._client.get_or_create_collection(
            name="love_memory",
            metadata={"hnsw:space": "cosine"},
        )

    async def save(self, user_id: int, entry: MemoryEntry) -> None:
        doc_id = f"{user_id}_{int(time.time() * 1000)}_{hash(entry.content) % 10000}"
        self._collection.add(
            ids=[doc_id],
            documents=[entry.content],
            metadatas=[{
                "user_id": user_id,
                "type": entry.memory_type,
                "importance": entry.importance,
                **entry.metadata,
            }],
        )
        log_event(
            logger, 20, "memory.long_term.save",
            user_id=user_id, type=entry.memory_type,
            importance=entry.importance,
            preview=entry.content[:60],
        )

    async def search(self, user_id: int, query: str, k: int = 5) -> list[dict]:
        start = time.monotonic()
        results = self._collection.query(
            query_texts=[query],
            n_results=k,
            where={"user_id": user_id},
        )
        elapsed = int((time.monotonic() - start) * 1000)

        entries = []
        if results and results["documents"] and results["documents"][0]:
            for doc, meta, dist in zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0],
            ):
                entries.append({
                    "content": doc,
                    "metadata": meta,
                    "score": 1 - dist,  # cosine distance → similarity
                })

        log_event(
            logger, 20, "memory.long_term.search",
            user_id=user_id, query=query[:60],
            results=len(entries), duration_ms=elapsed,
        )
        return entries

    async def get_important(self, user_id: int, min_importance: float = 0.7) -> list[dict]:
        results = self._collection.get(
            where={"$and": [{"user_id": user_id}, {"importance": {"$gte": min_importance}}]},
        )
        entries = []
        if results and results["documents"]:
            for doc, meta in zip(results["documents"], results["metadatas"]):
                entries.append({"content": doc, "metadata": meta})
        return entries
