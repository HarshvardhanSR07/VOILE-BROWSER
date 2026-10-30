# Voile Browser: Target Users, Practical Value & Future Potential

## 1. Target Users
1. **Competitive Researchers & Market Analysts**:
   Professionals who spend hours manually navigating dozens of corporate websites, copy-pasting pricing numbers into spreadsheets, and verifying sources.
2. **Growth Marketers, Founders & Product Leads**:
   Teams launching new products who need instant audience persona breakdowns, competitor benchmarking, and multi-channel creative campaign assets.
3. **Privacy-Conscious Engineers & Enterprise Developers**:
   Technical users who demand hardened anti-fingerprinting shields, zero telemetry broadcast, and local-first execution without third-party data harvesting.

---

## 2. Practical Value (Why Voile Wins)

- **Eliminates Manual Cross-Application Context Switching**:
  Instead of juggling Chrome, separate LLM chat windows, scrapers, and Excel, Voile combines the web runtime and agent execution inside a single desktop shell.
- **Outcome Verification Over Hallucination**:
  Traditional web agents frequently fabricate missing data when pages lack clear tables. Voile enforces a strict read-back verification loop: every written artifact is re-read from disk, and missing facts are explicitly tagged `UNKNOWN (no source found)`.
- **Absolute User Control & Safety**:
  Consequential operations (`HIGH` risk) never execute autonomously. The Policy Engine mandates an approval modal with diff previews. If a CAPTCHA or login appears, the agent safely defers to Manual Takeover.
- **Prompt-Injection Immune**:
  All external web data is isolated within `<untrusted_web_content>` boundaries, protecting the user's system from adversarial jailbreaks embedded in public web pages.

---

## 3. Future Potential & Roadmap

1. **Local Small Language Model (SLM) Offline Execution**:
   Integrate local on-device inference via WebGPU / ONNX Runtime (e.g. Qwen 2.5 7B or Llama 3.2 3B) for 100% air-gapped autonomous browsing.
2. **Multi-Tab Parallel Agent Swarms**:
   Expand the Tool Router to concurrently research 10 tabs simultaneously in isolated background worker threads.
3. **Native Enterprise Connectors**:
   Direct write-back integrations into Google Sheets, Notion, Airtable, and Salesforce via encrypted OAuth 2.0 PKCE tokens.
