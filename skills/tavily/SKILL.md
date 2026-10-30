---
name: tavily
description: Integration guide and reference for Tavily Live Web Search API powering Voile's Scout/AdaL mascot.
---

# Tavily Live Web Search for Voile Mascot (AdaL)

This skill documents how Voile's interactive companion mascot (**Scout / AdaL**) utilizes **Tavily Search API** as its real-time, privacy-focused search engine to retrieve live facts, documentation, news, and external context from the web.

## 1. Environment & Credentials

- **API Endpoint**: `https://api.tavily.com/search`
- **API Key**: `Set in .env as VITE_TAVILY_API_KEY`
- **HTTP Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <YOUR_TAVILY_API_KEY>`
  - `Content-Type: application/json`

---

## 2. API Request Structure

```bash
curl -X POST "https://api.tavily.com/search" \
  -H "Authorization: Bearer <YOUR_TAVILY_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the latest release of Electron js in 2026?",
    "search_depth": "basic",
    "include_answer": true,
    "max_results": 4
  }'
```

### Response Format
```json
{
  "query": "...",
  "answer": "Direct synthesized answer from live web sources...",
  "results": [
    {
      "title": "Page Title",
      "url": "https://example.com/page",
      "content": "Relevant excerpt from the page...",
      "score": 0.92
    }
  ],
  "response_time": 1.2
}
```

---

## 3. Multi-Engine Mascot Pipeline

AdaL combines three specialized engines into a unified response loop:

1. **Stage 1 (Parallel Dual Retrieval)**:
   - **Cognee**: Recalls internal knowledge graph entities and semantic memory.
   - **Tavily**: Searches the live web for real-time facts, news, and external sources.
   - Both requests run concurrently via `Promise.all` (~1.5s total retrieval time).

2. **Stage 2 (Groq LLM Synthesis)**:
   - The user query + Tavily search results + Cognee memory context are fed into **Groq (`qwen/qwen3.8-27b`)**.
   - Groq synthesizes a coherent, friendly, and structured reply with markdown links to sources.

3. **Stage 3 (High-Availability Fallback)**:
   - If Groq LLM is unreachable or times out, AdaL directly utilizes Tavily's synthesized `answer` and source list, ensuring zero service disruption.
