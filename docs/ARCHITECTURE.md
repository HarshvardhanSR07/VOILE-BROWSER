# Voile Browser: Autonomous Multimodal Companion Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 VOILE APPLICATION LAYER                                │
│                                                                                        │
│  ┌─────────────────────────┐                     ┌──────────────────────────────────┐  │
│  │    Active Browser Tab   │                     │     AdaL Autonomous Companion    │  │
│  │  ┌───────────────────┐  │                     │  ┌────────────────────────────┐  │  │
│  │  │ Chromium Webview  │  │                     │  │   Multi-Step Goal Input    │  │  │
│  │  │  (Guest Context)  │  │                     │  └──────────────┬─────────────┘  │  │
│  │  └─────────▲─────────┘  │                     │  ┌──────────────▼─────────────┐  │  │
│  │            │            │                     │  │  Editable Plan & Steps     │  │  │
│  └────────────┼────────────┘                     │  └──────────────┬─────────────┘  │  │
│               │                                  │  ┌──────────────▼─────────────┐  │  │
│               │ CDP 1.3 / IPC                    │  │  Live Execution Timeline   │  │  │
│               │                                  │  └──────────────┬─────────────┘  │  │
│               │                                  │  ┌──────────────▼─────────────┐  │  │
│               │                                  │  │  Approval Gate (HIGH Risk) │  │  │
│               │                                  │  └────────────────────────────┘  │  │
│  ┌────────────▼───────────────────────────────┐  └──────────────────────────────────┘  │
│  │          ELECTRON MAIN PROCESS             │                                        │
│  │  ┌──────────────────────────────────────┐  │                                        │
│  │  │     CdpToolRouter (CDP 1.3 Engine)   │  │                                        │
│  │  │  • Page.navigate / wait for load     │  │                                        │
│  │  │  • DOM.getDocument / Accessibility   │  │                                        │
│  │  │  • Input.dispatchMouseEvent (Clicks) │  │                                        │
│  │  │  • Page.captureScreenshot (Evidence) │  │                                        │
│  │  └──────────────────┬───────────────────┘  │                                        │
└────────────────────────┼───────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────────────────────────────────┐
│                                 AGENT RUNTIME ENGINE                                   │
│                                                                                        │
│  ┌───────────────────┐       ┌────────────────────┐       ┌─────────────────────────┐  │
│  │      Planner      │ ────► │   Policy Engine    │ ────► │  Execution Controller   │  │
│  │  (Goal -> Plan)   │       │ (LOW, MED, HIGH)   │       │  (State Machine Loop)   │  │
│  └───────────────────┘       └────────────────────┘       └────────────┬────────────┘  │
│                                                                        │               │
│                                      ┌─────────────────────────────────┴─────────────┐ │
│                                      ▼                                               ▼ │
│                         ┌──────────────────────────┐                    ┌────────────┴┐│
│                         │   Prompt Injection Guard │                    │  Verifier   ││
│                         │ (<untrusted_web_content>)│                    │ (Read-Back) ││
│                         └──────────────────────────┘                    └─────────────┘│
└──────────────────────────────────────┬─────────────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼─────────────────────────────────────────────────┐
│                               INTEGRATIONS & ARTIFACTS                                 │
│  • ExcelJS Spreadsheet Engine (.xlsx & .csv write + verified read-back loop)           │
│  • Multimodal GTM Campaign Pack (Target audience, competitor matrix, 30s video script) │
│  • OS Encrypted Keychain & Local Task Memory Store (Zero cloud leak)                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Step Execution State Machine

Every task step adheres to an honest, evidence-verified state lifecycle:

$$\text{PENDING} \longrightarrow \text{RUNNING} \longrightarrow [\text{AWAITING\_APPROVAL}] \longrightarrow \text{VERIFYING} \longrightarrow \text{DONE / FAILED / CANCELLED}$$

- **`PENDING`**: Step is queued and fully editable by the user.
- **`RUNNING`**: The agent tool router dispatches commands via Chrome DevTools Protocol (CDP) to the active web tab.
- **`AWAITING_APPROVAL`**: Consequential actions (`HIGH` risk) suspend automation and trigger a visual approval modal.
- **`VERIFYING`**: The agent re-reads the output artifact (e.g. reading back written spreadsheet cells from disk) before granting completion.
- **`DONE`**: The step succeeds with an attached `StepEvidence` payload (file hash, DOM citation, read-back values).
- **`FAILED`**: Honest failure reporting if an endpoint is unreachable, pricing is unlisted, or verification fails.

---

## 2. Policy Engine & Risk Categorization

| Risk Level | Trigger Criteria | Policy Action |
| :--- | :--- | :--- |
| **LOW** | Navigation, DOM reading, accessibility tree extraction, web research | **Auto-run**: Executes immediately, logs output. |
| **MEDIUM** | Local file creation (`.xlsx`, `.csv`), draft generation | **Diff preview & run**: Shows artifact preview, writes safely to disk. |
| **HIGH** | Consequential operations (publish, send, delete, submit form, payment) | **Approval Gate**: Execution freezes. Modal requires human authorization. |

---

## 3. Outcome Verification Protocol

Voile follows the **Read-Back Verification Rule**:
1. When generating spreadsheets (`Workflow A`), the file buffer is written, then **re-loaded into an independent ExcelJS reader**.
2. Every cell is verified against raw citations.
3. If pricing or source data cannot be proven, the cell is tagged with `UNKNOWN (no source found)`. The system never hallucinates missing data.
4. If row count or cell values fail to match, the step is marked `FAILED` with an actionable diagnosis.

---

## 4. Prompt-Injection Defense Architecture

All webpage text scraped via CDP is considered **UNTRUSTED**:
- The agent passes DOM text through `sanitizeUntrustedWebContent()`.
- Content is stripped of override commands (`"ignore previous instructions"`, `"system:"`, `"developer mode"`).
- Text is wrapped inside `<untrusted_web_content source="..." verified_untrusted="true">` tags.
- The LLM planner is strictly instructed to treat this data as passive information and never execute directives found within web content.
