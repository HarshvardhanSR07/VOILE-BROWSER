# Voile Browser: 3-4 Minute Hackathon Demo Script

## Overview
- **Product**: Voile Browser with AdaL Autonomous Multimodal Companion
- **Duration**: 3 minutes 45 seconds
- **Presenter Role**: Lead Builder / Product Engineer

---

### [00:00 - 00:45] Act 1: The AI-Native Browser Shell
1. **Launch Voile**:
   - Double-click `Voile.exe` (or run `npm start`).
   - Highlight the zero-latency launch: *"Voile is a modern desktop browser built on Electron and Chromium. It runs completely locally with built-in Chameleon anti-fingerprinting shields."*
2. **Open the Companion**:
   - Click the **AdaL Agent** button in the top browser toolbar.
   - The autonomous side-panel slides open smoothly: *"Unlike sidecars or floating chatbots, AdaL is an autonomous companion with a live step planner, CDP tab driver, policy engine, and outcome verifier."*

---

### [00:45 - 01:50] Act 2: Workflow A — Real Action & Outcome Verification
1. **Launch Workflow A**:
   - Click the preset pill: `📊 10 AI Startups Spreadsheet`.
   - Watch AdaL instantly synthesize a 6-step editable plan: *"AdaL translates the goal into concrete steps. Notice each step has an explicit risk tier: LOW for scraping, MEDIUM for writing documents."*
2. **Click "Start Execution"**:
   - Watch the active tab navigate live via Chrome DevTools Protocol (CDP 1.3).
   - In the **Live Log** tab, show real-time events tagged `[CDP-TAB]`, `[ROUTER]`, and `[VERIFIER]`.
3. **Outcome Read-Back & Unknown Flagging**:
   - When Step 5 and 6 execute, show the Excel generation.
   - Point out the verifier badge: *"Notice how AdaL doesn't just write and assume success. It re-reads the spreadsheet buffer from disk to verify row counts. For Scale AI, where public pricing is unlisted, it refuses to hallucinate and explicitly marks: 'UNKNOWN (no source found)'."*

---

### [01:50 - 02:40] Act 3: User Control — Pause, Cancel & Manual Takeover
1. **Manual Takeover**:
   - Click the **TAKEOVER** button in the toolbar.
   - The button illuminates in pulsing amber: `TAKEOVER ON`.
   - Explain: *"If a website presents a CAPTCHA, 2FA, or login screen, the agent never tries to bypass it. The user takes over control, handles the credentials manually, and clicks to resume."*
2. **Pause & Resume**:
   - Click **Pause**: execution state freezes. Click **Play**: execution resumes.

---

### [02:40 - 03:25] Act 4: Workflow B — Multimodal GTM Pack & Approval Gate
1. **Launch Workflow B**:
   - Click the preset: `🚀 GTM Campaign & Assets`.
   - Steps generate: Target Audience $\to$ Competitor Matrix $\to$ Creative Concepts $\to$ Supporting Assets $\to$ Launch Campaign.
2. **Hit the Approval Gate (HIGH Risk)**:
   - When the final campaign publishing step is reached, the **Action Approval Gate Modal** pops up.
   - Emphasize safety: *"Consequential actions like publishing, sending, or deleting never happen automatically. The policy engine halts the runtime with a full payload preview until I click 'Approve & Execute'."*
   - Click **Approve**.

---

### [03:25 - 03:45] Act 5: Verified Artifacts Gallery & Close
1. **Artifacts View**:
   - Switch to the **Artifacts** tab.
   - Show `AI Startups Market Matrix (.xlsx)` and `Launch Campaign GTM Pack (DRAFT)`.
   - Click **Open Artifact** to display the generated verified deliverable.
2. **Closing Statement**:
   - *"Voile combines privacy-first browsing with genuine autonomous execution: verified outcomes, prompt-injection defense, and total human control. Thank you."*
