"""
RAG Engine Service
Retrieval-Augmented Generation for context-aware Q&A.
"""
import os
from typing import Dict, List, Optional


class RAGEngine:
    """RAG engine for intelligent Q&A over annual reports"""

    def __init__(self, vector_store):
        self.vector_store = vector_store
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model = None
        self._initialize_llm()

    def _initialize_llm(self):
        """Initialize the LLM (Google Gemini)"""
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except ImportError:
                print("google-generativeai not installed. Using fallback responses.")
                self.model = None
        else:
            print("No Gemini API key found. Using demo mode.")
            self.model = None

    def query(self, question: str) -> dict:
        """Process a question using RAG"""
        # Retrieve relevant context
        context_results = self.vector_store.query(question, n_results=5)
        context_docs = context_results.get("documents", [])
        context_meta = context_results.get("metadatas", [])

        # Build context string
        context = "\n\n---\n\n".join(context_docs) if context_docs else ""

        # Build sources
        sources = []
        for i, meta in enumerate(context_meta):
            if isinstance(meta, dict):
                sources.append({
                    "title": meta.get("filename", f"Document {i+1}"),
                    "relevance": round(1.0 - (context_results["distances"][i] if i < len(context_results.get("distances", [])) else 0.5), 2)
                })

        if self.model and context:
            try:
                answer = self._generate_with_context(question, context)
                return {
                    "answer": answer,
                    "sources": sources
                }
            except Exception as e:
                print(f"LLM generation error: {e}")

        # If no context or LLM not available, raise to trigger demo fallback
        raise Exception("No context available or LLM not configured")

    def _generate_with_context(self, question: str, context: str) -> str:
        """Generate answer using LLM with retrieved context"""
        prompt = f"""You are an expert financial analyst AI assistant specializing in annual report analysis and investment intelligence.

Based on the following context from annual reports, provide a detailed, actionable answer to the user's question.
Format your response with markdown for clarity. Include specific numbers, trends, and recommendations where applicable.

CONTEXT FROM ANNUAL REPORTS:
{context}

USER QUESTION: {question}

Provide a comprehensive, well-structured answer with:
1. Direct answer to the question
2. Supporting data/numbers from the context
3. Actionable insights or recommendations
4. Any relevant risk factors or caveats"""

        response = self.model.generate_content(prompt)
        return response.text

    def _build_system_prompt(self) -> str:
        """Build a system prompt for the financial analyst persona"""
        return """You are an expert financial analyst AI assistant for an Annual Report Analysis platform.
Your role is to:
- Analyze financial data from annual reports
- Provide location-based investment insights
- Identify demand patterns and peak periods
- Deliver actionable investment recommendations
- Assess and communicate risk factors

Always be specific, data-driven, and provide clear recommendations.
Format responses with markdown for readability."""
