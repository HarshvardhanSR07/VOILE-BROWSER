---
name: cognee
description: Integration guide and reference for Cognee Knowledge Graph Memory Layer and Groq LLM powering Voile's Scout/AdaL mascot.
---

# Cognee Knowledge Graph Memory & Groq LLM for Voile Mascot

This skill documents how Voile's interactive mascot companion (Scout / AdaL) leverages **Cognee** as its persistent graph memory layer and **Groq** as its ultra-fast high-performance LLM inference engine.

## 1. Environment & Credentials

### Cognee Memory Layer
- **Base URL**: `https://tenant-b4471389-2067-4bed-9646-8ff9314a86f1.aws.cognee.ai`
- **API Key**: `Set in .env as VITE_COGNEE_API_KEY`
- **Recall Endpoint**: `POST /api/v1/recall`
- **Headers**:
  - `X-Api-Key: <COGNEE_API_KEY>`
  - `Content-Type: application/json`

### Groq LLM Engine
- **Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
- **API Key**: `Set in .env as VITE_GROQ_API_KEY`
- **Model**: `qwen/qwen3.8-27b`

---

## 2. Cognee Recall Workflow

To recall relevant entities, facts, and relationships from the memory graph:

```bash
curl -X POST "https://tenant-b4471389-2067-4bed-9646-8ff9314a86f1.aws.cognee.ai/api/v1/recall" \
  -H "X-Api-Key: <YOUR_COGNEE_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the main entities?"}'
```

### Response Format
```json
[
  {
    "kind": "graph_completion",
    "search_type": "HYBRID_COMPLETION",
    "text": "The main entities are: ...",
    "dataset_id": "...",
    "dataset_name": "default_dataset"
  }
]
```

---

## 3. Two-Stage Memory-Augmented Mascot Architecture

1. **Stage 1 (Graph Memory Recall)**:
   When the user submits a message to the mascot, the query is first dispatched to Cognee's `/api/v1/recall`. Cognee performs hybrid vector and knowledge-graph traversal to retrieve known entities, facts, and context.

2. **Stage 2 (Groq LLM Synthesis)**:
   The user prompt + recalled Cognee memory context are formatted into a system prompt for Groq (`qwen/qwen3.8-27b`). Groq generates an instant, intelligent, grounded response.

3. **Stage 3 (Client-Side Streaming / Display)**:
   The response is streamed or rendered in the mascot's speech bubble / chat companion panel with badge indicators showing active Cognee Memory and Groq LLM integration.
