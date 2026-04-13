"""
Vector Store Service
Manages document storage for semantic search (RAG)
Falls back gracefully when FAISS/sentence-transformers are unavailable
"""

import os
import json
import math
import hashlib
from collections import Counter
from datetime import datetime


class VectorService:
    def __init__(self, store_path):
        self.store_path = store_path
        self.documents = {}  # doc_id -> {text, chunks, metadata}
        self.use_faiss = False
        self.index = None
        self.encoder = None

        # Try to initialize FAISS
        try:
            import numpy as np
            import faiss
            self.embedding_dim = 384
            self.index = faiss.IndexFlatL2(self.embedding_dim)
            self.use_faiss = True
            self.np = np
            print("[OK] FAISS vector store initialized")
        except ImportError:
            print("[INFO] FAISS not available, using TF-IDF text search")

        # Try to load sentence transformer
        try:
            from sentence_transformers import SentenceTransformer
            self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
            print("[OK] Sentence Transformer loaded")
        except ImportError:
            print("[INFO] Sentence Transformers not available, using keyword matching")

        self.doc_index_map = {}
        self.index_to_chunk = {}
        self.current_index = 0

    def _chunk_text(self, text, chunk_size=500, overlap=100):
        """Split text into overlapping chunks"""
        chunks = []
        words = text.split()
        for i in range(0, len(words), chunk_size - overlap):
            chunk = ' '.join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)
        if not chunks and text.strip():
            chunks.append(text[:2000])
        return chunks

    def _get_tfidf_vector(self, text):
        """Simple TF-IDF-like vector for text similarity"""
        words = text.lower().split()
        word_counts = Counter(words)
        total = len(words) if words else 1
        return {word: count / total for word, count in word_counts.items()}

    def _cosine_sim(self, vec_a, vec_b):
        """Compute cosine similarity between two sparse vectors (dicts)"""
        common_keys = set(vec_a.keys()) & set(vec_b.keys())
        if not common_keys:
            return 0.0

        dot_product = sum(vec_a[k] * vec_b[k] for k in common_keys)
        mag_a = math.sqrt(sum(v ** 2 for v in vec_a.values()))
        mag_b = math.sqrt(sum(v ** 2 for v in vec_b.values()))

        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot_product / (mag_a * mag_b)

    def add_document(self, doc_id, text, metadata=None):
        """Add document to vector store"""
        chunks = self._chunk_text(text)
        self.documents[doc_id] = {
            'text': text,
            'chunks': chunks,
            'vectors': [self._get_tfidf_vector(chunk) for chunk in chunks],
            'metadata': metadata or {},
            'added_at': datetime.utcnow().isoformat()
        }

        if self.use_faiss and self.encoder and chunks:
            indices = []
            for chunk in chunks:
                embedding = self.encoder.encode(chunk, show_progress_bar=False).astype('float32')
                if embedding.ndim == 1:
                    embedding = embedding.reshape(1, -1)
                self.index.add(embedding)
                self.index_to_chunk[self.current_index] = (doc_id, chunk)
                indices.append(self.current_index)
                self.current_index += 1
            self.doc_index_map[doc_id] = indices

        return True

    def search(self, query, top_k=5):
        """Search for relevant document chunks"""
        if not self.documents:
            return []

        # Use FAISS if available
        if self.use_faiss and self.encoder and self.index and self.index.ntotal > 0:
            query_embedding = self.encoder.encode(query, show_progress_bar=False).astype('float32')
            if query_embedding.ndim == 1:
                query_embedding = query_embedding.reshape(1, -1)

            k = min(top_k, self.index.ntotal)
            distances, indices = self.index.search(query_embedding, k)

            results = []
            for i, idx in enumerate(indices[0]):
                if idx >= 0 and idx in self.index_to_chunk:
                    doc_id, chunk = self.index_to_chunk[idx]
                    results.append({
                        'doc_id': doc_id,
                        'text': chunk,
                        'score': float(1 / (1 + distances[0][i])),
                        'metadata': self.documents.get(doc_id, {}).get('metadata', {})
                    })
            return results

        # Fallback: TF-IDF cosine similarity
        query_vec = self._get_tfidf_vector(query)
        results = []

        for doc_id, doc in self.documents.items():
            for i, chunk in enumerate(doc.get('chunks', [])):
                chunk_vec = doc['vectors'][i] if i < len(doc.get('vectors', [])) else self._get_tfidf_vector(chunk)
                score = self._cosine_sim(query_vec, chunk_vec)

                # Also boost by keyword overlap
                query_words = set(query.lower().split())
                chunk_words = set(chunk.lower().split())
                keyword_overlap = len(query_words & chunk_words) / max(len(query_words), 1)
                combined_score = 0.6 * score + 0.4 * keyword_overlap

                if combined_score > 0.01:
                    results.append({
                        'doc_id': doc_id,
                        'text': chunk[:500],
                        'score': combined_score,
                        'metadata': doc.get('metadata', {})
                    })

        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:top_k]

    def remove_document(self, doc_id):
        """Remove document from store"""
        if doc_id in self.documents:
            del self.documents[doc_id]
            if doc_id in self.doc_index_map:
                for idx in self.doc_index_map[doc_id]:
                    if idx in self.index_to_chunk:
                        del self.index_to_chunk[idx]
                del self.doc_index_map[doc_id]

    def clear_all(self):
        """Clear all documents and vectors"""
        self.documents.clear()
        self.doc_index_map.clear()
        self.index_to_chunk.clear()
        self.current_index = 0
        if self.use_faiss:
            try:
                import faiss
                self.index = faiss.IndexFlatL2(self.embedding_dim)
            except:
                pass

    def get_stats(self):
        """Get vector store statistics"""
        return {
            'total_documents': len(self.documents),
            'total_chunks': sum(len(d.get('chunks', [])) for d in self.documents.values()),
            'faiss_available': self.use_faiss,
            'encoder_available': self.encoder is not None,
        }
