# Voile Browser: AI-Native Browser + Autonomous Multimodal Companion (AdaL)

> **Hackathon Prototype: Problem Statement 1 — AI-Native Browser with an Autonomous Multimodal Companion using AdaL**

Voile Browser is a high-performance desktop browser built with Electron, Chromium, and React. It pairs privacy-first browsing (Chameleon anti-fingerprinting, universal cosmetic ad-blocking) with **AdaL**, an autonomous multimodal companion capable of planning multi-step instructions, operating real browser tabs via Chrome DevTools Protocol (CDP 1.3), writing real documents, and strictly verifying outcomes through read-back loops.

---

## 7 Mandatory Capabilities Implemented

1. **Natural-Language Task Execution**: Multi-step user prompts are translated into an editable, sequential execution plan.
2. **Real Tool Execution**: Operates real tabs and documents via native CDP 1.3 (`browser_navigate`, `browser_snapshot_dom`, `browser_click_element`, `spreadsheet_write_and_verify`).
3. **Outcome Verification**: Re-reads files back from disk (e.g. loads generated `.xlsx` buffer into an independent reader) before marking steps `DONE`.
4. **Transparent Execution**: A live companion side-panel displays the editable plan, active step, CDP actions, verifier evidence, and real-time logs.
5. **Human-in-the-Loop Control**: Features `Pause`, `Resume`, `Cancel`, `Manual Takeover` (for CAPTCHA/login), and a strict **Approval Gate Modal** for consequential (`HIGH` risk) actions.
6. **Capability Orchestration**: End-to-end workflows chaining browser navigation, web research, ExcelJS spreadsheet generation, and GTM creative asset generation.
7. **Mandatory AdaL Usage**: Full evidence logged in [`docs/ADAL_USAGE.md`](docs/ADAL_USAGE.md) documenting timestamped planning, auditing, coding, and browser testing.

---

## Two Flagship Workflows

- **Workflow A (Pillar 1)**: `"Research 10 AI startups, compare product and pricing, and create a spreadsheet."`
  - Gathers 10 real AI companies (OpenAI, Anthropic, Perplexity, Mistral, Cohere, Scale AI, Hugging Face, Runway, Midjourney, Cursor).
  - Collects verified public pricing models.
  - Honestly flags unlisted enterprise pricing as `UNKNOWN (no source found)` (e.g. Scale AI).
  - Writes styled `.xlsx` and `.csv` files via ExcelJS and re-reads the file from disk to verify row counts and cell citations.
- **Workflow B (Pillar 2)**: `"Analyse target audience for product X, research competitors, create marketing concept, generate supporting assets, and prepare a launch campaign."`
  - Synthesizes target audience ICP persona, benchmarks 3 market competitors, generates creative hooks and image prompts, produces a 30-second video/voiceover script, and compiles a launch calendar kept as `DRAFT` until user approval.

---

## Quickstart & Setup (Under 5 Minutes)

### Prerequisites
- Node.js 18+ (tested on Node v20 / v22)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch the Application
```bash
npm start
```
*Voile Browser opens instantly with zero cloud dependencies or localhost servers.*

### 3. Or Run the Standalone Windows Binary
You can run the pre-compiled standalone binary directly without any terminal:
```bash
release\Voile-win32-x64\Voile.exe
```

---

## Running Verification Tests

Run the comprehensive automated test suites covering all agent capabilities, CDP tab routing, outcome verification, and security rules:

```bash
# 1. Full Autonomous Agent Test Suite (Workflow A, Workflow B, Verifier & Controls)
npx electron electron/verify_autonomous_agent.cjs

# 2. Transparent Execution UI Test Suite
npx electron electron/verify_slice_1.cjs

# 3. Tab Navigation & Webview Lifecycle Test Suite
npx electron electron/verify_adal_navigation.cjs

# 4. Identity Bridge Authentication Test Suite (RFC 8252 + PKCE)
npx electron electron/verify_identity_bridge.cjs
```

---

## Documentation Index

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): System architecture diagram, CDP 1.3 tool router, risk tiers, and prompt-injection defense.
- [`docs/TEST_CASES.md`](docs/TEST_CASES.md): Verified SUCCESS and honest FAILURE test cases with recovery options.
- [`docs/ADAL_USAGE.md`](docs/ADAL_USAGE.md): Genuine timestamped evidence log documenting AdaL's role across all sessions.
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md): 3-4 minute presentation guide for hackathon judges.
- [`docs/VALUE.md`](docs/VALUE.md): Target users, practical value, and future roadmap.
