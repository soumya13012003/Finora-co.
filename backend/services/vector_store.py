"""
Vector Store Service
Handles document embedding storage and semantic search using ChromaDB.
"""
import os
from typing import List, Dict, Optional


class VectorStoreService:
    """Service for managing vector embeddings with ChromaDB"""

    def __init__(self):
        self.collection = None
        self._initialize()

    def _initialize(self):
        """Initialize ChromaDB collection"""
        try:
            import chromadb
            from chromadb.config import Settings

            chroma_dir = os.getenv("CHROMA_DIR", "./chroma_db")
            os.makedirs(chroma_dir, exist_ok=True)

            self.client = chromadb.PersistentClient(path=chroma_dir)
            self.collection = self.client.get_or_create_collection(
                name="annual_reports",
                metadata={"description": "Annual report document chunks"}
            )
        except ImportError:
            print("ChromaDB not installed. Vector store will use in-memory fallback.")
            self.client = None
            self.collection = None
            self._memory_store = {
                "documents": [],
                "metadatas": [],
                "ids": []
            }

    def add_documents(self, documents: List[str], metadatas: List[dict], ids: List[str]):
        """Add documents to the vector store"""
        if self.collection is not None:
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
        else:
            self._memory_store["documents"].extend(documents)
            self._memory_store["metadatas"].extend(metadatas)
            self._memory_store["ids"].extend(ids)

    def query(self, query_text: str, n_results: int = 5) -> dict:
        """Query the vector store for similar documents"""
        if self.collection is not None:
            try:
                results = self.collection.query(
                    query_texts=[query_text],
                    n_results=min(n_results, self.collection.count() or 1)
                )
                return {
                    "documents": results.get("documents", [[]])[0],
                    "metadatas": results.get("metadatas", [[]])[0],
                    "distances": results.get("distances", [[]])[0]
                }
            except Exception as e:
                print(f"Query error: {e}")
                return {"documents": [], "metadatas": [], "distances": []}
        else:
            # Simple keyword matching fallback
            return self._keyword_search(query_text, n_results)

    def _keyword_search(self, query: str, n_results: int) -> dict:
        """Simple keyword-based search fallback"""
        query_words = set(query.lower().split())
        scored = []

        for i, doc in enumerate(self._memory_store["documents"]):
            doc_words = set(doc.lower().split())
            overlap = len(query_words & doc_words)
            if overlap > 0:
                scored.append((overlap, i))

        scored.sort(reverse=True)
        top = scored[:n_results]

        return {
            "documents": [self._memory_store["documents"][i] for _, i in top],
            "metadatas": [self._memory_store["metadatas"][i] for _, i in top],
            "distances": [1.0 / (s + 1) for s, _ in top]
        }

    def get_collection_stats(self) -> dict:
        """Get stats about the vector store"""
        if self.collection is not None:
            return {
                "total_documents": self.collection.count(),
                "collection_name": "annual_reports"
            }
        return {
            "total_documents": len(self._memory_store["documents"]),
            "collection_name": "in_memory_fallback"
        }
