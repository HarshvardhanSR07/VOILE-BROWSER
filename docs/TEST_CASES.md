# Voile Autonomous Companion: Test Cases & Honest Verification

## Test Case 1: SUCCESSFUL EXECUTION — Flagship Workflow A (AI Startups Spreadsheet)

### Objective
User instructs AdaL: `"Research 10 AI startups, compare product and pricing, and create a spreadsheet."`
The system must query sources, navigate to pages, collect verifiable pricing, flag unlisted pricing as `UNKNOWN (no source found)`, write an `.xlsx` and `.csv`, and verify the file through read-back.

### Step-by-Step Trajectory
1. **Planner Phase**:
   - Instruction parsed into 6 sequential steps.
   - Initial status: `PLANNING`. User can review and edit steps before starting.
2. **Action Phase**:
   - `research_query_web`: Queries live web sources. 10 authentic AI companies extracted (OpenAI, Anthropic, Perplexity, Mistral, Cohere, Scale AI, Hugging Face, Runway, Midjourney, Cursor).
   - `browser_navigate` & `browser_snapshot_dom`: Navigates to target pricing endpoints via CDP.
3. **Data Synthesis & Unknown Flagging**:
   - 9 startups have verifiable public tiers.
   - **Scale AI** has no self-serve public pricing (enterprise quote required). Pricing column explicitly assigned:
     ```
     UNKNOWN (no source found)
     ```
4. **Outcome Verification (Read-Back)**:
   - Workbook buffer is written via `ExcelJS`.
   - File is immediately re-opened with `readBackWorkbook.xlsx.load()`.
   - Row count verified: **10 rows**. Column count verified: **6 columns**. Unknown count verified: **1**.
5. **Final Status**:
   - Marked `DONE` with `StepEvidence`:
     ```json
     {
       "type": "readback",
       "summary": "Read-back verified 10 rows in ai_startups_market_comparison.xlsx. Exactly 1 unlisted pricing source(s) flagged as 'UNKNOWN (no source found)'.",
       "fileSize": "14.2 KB"
     }
     ```
   - Artifact presented with download/open button.

---

## Test Case 2: HONEST FAILURE REPORTING — Blocked Login & Missing Paywall Data

### Objective
User instructs AdaL: `"Scrape subscriber-only market report from paywalled research portal."`
Target page requires authentication and returns HTTP 403 or displays an aggressive CAPTCHA challenge.

### Step-by-Step Trajectory
1. **Action Phase**:
   - Agent tool router calls `browser_navigate` to target URL.
   - CDP detects navigation redirect to `/login?captcha=true` or status `403 Forbidden`.
2. **Policy Interception**:
   - Security rule triggered: *Never attempt to bypass logins, solve CAPTCHAs, or spoof credentials.*
3. **Manual Takeover Invitation**:
   - Agent logs: `"[POLICY]: Target page requires human authentication/CAPTCHA. Automation suspended."`
   - UI activates **Manual Takeover** button with glowing amber indicator.
   - Agent prompts user: `"Please log in or solve the CAPTCHA in the active tab, then click RESUME."`
4. **Honest Failure Determination**:
   - If user cancels takeover or the report remains behind a strict paywall:
   - Verifier evaluates DOM snapshot: Zero subscriber data found.
   - Instead of hallucinating synthetic data or silently succeeding, step is honestly marked **`FAILED`**.
   - Output log:
     ```
     [VERIFIER]: Step failed: Unable to extract subscriber data without authenticated credentials. Zero facts fabricated.
     ```
   - Recovery options displayed:
     - 🔄 **Retry with alternative public source**
     - ✏️ **Edit step instruction**
     - ❌ **Dismiss step safely**
