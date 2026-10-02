# Startup Scheme & Funding Intelligence Agent - Project Analysis

**Team Name:** IceCube
**Team Members:** Mayank Chaudhary, Mohd Aaftab, Srishti Mishra, Akriti Rao
**Event:** Codeblitz 2.0 (2026)
**Tagline:** "Know exactly why you qualify, not just what exists"

---

## 1. The Problem
Startups face significant challenges when navigating government support:
- **Scattered Information:** Government startup schemes are dispersed across multiple portals, PDFs, ministries, and state policies.
- **Complex Eligibility:** Qualification depends on numerous variables including startup age, DPIIT status, sector, turnover, location, and funding stage.
- **Time-Consuming:** Founders waste hours searching for and comparing documentation instead of building their product.
- **Unreliable AI:** Generic AI tools often lack verifiable sources and fail to account for constantly changing scheme details over time.

## 2. The Solution & Scope
An AI-powered agent designed to make government startup support **discoverable, explainable, verified, and actionable**. 

**Core Workflow Scope:**
1. **Startup Profile:** Extract and build a business profile from founder's documents.
2. **Scheme Discovery:** Find relevant government funding opportunities.
3. **Eligibility Check:** Verify specific qualifications against the profile.
4. **Official Evidence:** Link every decision to an official government clause.
5. **Missing Requirements (Gap Analysis):** Point out missing documents or criteria.
6. **Incubator Matching:** Suggest suitable incubators based on the startup's profile.
7. **Action Plan (Application Ready):** Create simple application checklists and drafts.

## 3. Key Features
- **Scheme Discovery:** Quickly find relevant central, state, and sector-specific government schemes.
- **Eligibility Check:** Automated verification of startup-specific requirements.
- **Source Verification:** Show official documents and specific clauses for transparency.
- **Document Analysis:** OCR and Document Intelligence to extract details from uploaded files.
- **Gap Analysis:** Identify missing requirements and suggest actionable steps.
- **Incubator Matching:** Find suitable incubators based on guidelines and startup needs.
- **Policy Updates:** Track changes in scheme guidelines and identify affected startups.
- **Application Support:** Generate checklists and application drafts to move beyond discovery to actual submission.
- **Hindi & Hinglish Support:** Multilingual support to make the system easier to use for a broader audience.

## 4. Innovations & USPs
- **Evidence-First Eligibility:** Every AI decision is strictly linked to an official government clause.
- **Hybrid RAG + Rule Engine:** Combines the contextual understanding of AI with deterministic rule-based eligibility checks.
- **Policy Change Detection:** Actively tracks changes in schemes and alerts startups that might be affected.
- **Eligibility Simulator:** Allows founders to tweak startup details to see how it affects their eligibility in real-time.
- **Multi-Agent Workflow:** Orchestrates separate AI agents to handle schemes, documents, eligibility, and applications independently.
- **Application Copilot:** Goes beyond simply finding schemes by actively helping founders prepare their actual applications.

## 5. Technology Stack
The project leverages a modern, AI-first technology stack:

*   **Frontend:** Next.js, TypeScript, Tailwind CSS
*   **Backend:** FastAPI, Node.js
*   **Database & State:** PostgreSQL, Redis
*   **AI & Document Processing:** LLM APIs, OCR, Document Intelligence
*   **RAG & Search:** Qdrant (Vector DB), Embeddings, Hybrid Search, Reranking
*   **Agentic Framework:** Model Context Protocol (MCP), Function Calling, Agent Orchestration
*   **Collaboration Layer:** Yjs / CRDTs (Conflict-free Replicated Data Types) for real-time collaboration.
*   **Monitoring & Traceability:** Policy Diff & Source Tracking

## 6. Impact & Scalability
- **Saves Time & Reduces Errors:** Automates hours of manual research with rule-based checks tied to official sources.
- **Better Access:** Lowers the barrier to entry for early-stage founders to receive government support.
- **Built to Scale:** The multi-agent architecture allows easy addition of new schemes, states, and services.
- **Scalable Data & Reach:** Designed to cover Central, State, and Sector-specific schemes, supporting founders beyond just the English language.

---
*Analysis generated based on the provided Codeblitz 2.0 presentation by Team IceCube.*
