# Product Requirements Document (PRD): Multi-Agent Customer Support Crew

**Project**: Multi-Agent Customer Support Crew (Capstone)  
**Version**: 1.0  
**Date**: 2026-05-03  
**Owner**: Product Manager (@product-mgr)  
**Status**: Ready for Build Phase (after review of Open Questions)  

---

## Context & Instructions

This PRD is authored for the AAMAD Define phase and is intended to be sufficiently explicit for downstream build agents to implement autonomously. All requirements trace back to the finalized Market Research Document (MRD) at:

- `project-context/1.define/mrd.md`

Key MRD themes that drive this PRD:

- Strong growth in conversational AI / call-center AI markets and increased demand for instant service [MRD Sources 1–2].
- A trust gap: many customers prefer not to interact with AI for service; the experience must be designed for trust and easy human escalation [MRD Source 8].
- Multi-agent orchestration is the differentiator: role specialization, evidence-first responses, and safe escalation (human-in-the-loop) [MRD Sections 2–3].
- MVP channels: **web chat + email + WhatsApp**; MVP has **no helpdesk integration** and instead outputs **helpdesk-ready artifacts** [MRD Assumptions].

**Selected Runtime**: `crewai`

---

## 1. Executive Summary

### 1.1 Problem Statement (Research-backed)

Customer support organizations face three compounding problems:

- **High operational load and inconsistency**: triage, retrieval, and escalation depend on human judgment and tribal knowledge, leading to variable outcomes and slower resolution.
- **Channel fragmentation**: support occurs across web chat, email, and messaging channels, increasing complexity and context loss across handoffs.
- **Trust and transparency constraints**: customers are skeptical of AI in service contexts. Gartner reports **64% of customers would prefer companies didn’t use AI for customer service**, and **53% would consider switching** if they found out a company was going to use AI for customer service [MRD Source 8]. This increases the need for clear disclosure, explainability, and “easy path to a human.”

**Opportunity scope** (market-level, directional):

- Conversational AI and call-center AI segments are growing rapidly [MRD Sources 1–2], suggesting sustained investment and a large ecosystem of potential adopters.

### 1.2 Solution Overview (Evidence-based)

**Multi-Agent Customer Support Crew** is a multi-agent AI support system built with CrewAI that:

- ingests customer inquiries from **web chat, email, and WhatsApp**,
- performs **intent triage** and **risk classification**,
- retrieves knowledge from a curated **knowledge base (KB)** and produces **evidence-grounded** responses with citations,
- adapts responses using **sentiment-aware** guidelines,
- escalates safely via a **context-preserving escalation packet**, and
- proposes **KB improvements** based on unresolved questions and post-resolution learning (human approval required).

**Key differentiators** (from MRD):

- Multi-agent orchestration (role specialization + deterministic handoffs)
- Evidence-first responses (RAG + citations, no guessing)
- Trust-first design (explainability + explicit escalation)
- Helpdesk-ready outputs even before integrations exist

### 1.3 Strategic Rationale

**Why multi-agent architecture is optimal**

Customer support is naturally decomposable into specialized responsibilities (triage, retrieval, resolution drafting, escalation management, learning loop). Multi-agent orchestration improves:

- **Maintainability**: update a specialist without destabilizing the entire system.
- **Safety**: isolate risky actions behind escalation gates and policies.
- **Quality**: separate “retrieve evidence” from “generate answer,” improving grounding.

**Market timing**

Enterprises are targeting increased automation (including “touchless” service goals) [MRD Source 5], while adoption maturity varies [MRD Sources 9–10]. This favors systems that can start in a safe, assistive mode and grow toward deeper automation.

---

## 2. Market Context & User Analysis

### 2.1 Target Market (From Research)

**Target market for the capstone**: generic customer support teams operating multi-channel support (web chat + email + WhatsApp), with a maintained knowledge base and measurable service KPIs (SLA/CSAT).

**Geographic focus**: English-first (EN) initial release; global conceptual applicability (deployments vary by compliance).

### 2.2 User Personas

#### Persona A — Support Operations Manager
- **Goals**: improve SLA compliance; reduce backlog; reduce escalations; standardize quality.
- **Key pains**: fragmented workflows, uneven answer quality, missing escalation context, KB drift.
- **Success metrics**: FRT, TTR, FCR, containment/deflection %, escalation %, reopen %, CSAT.

#### Persona B — Support Team Lead / QA Lead
- **Goals**: consistent policy adherence and tone; coach agents; reduce reopens.
- **Key pains**: training overhead, inconsistent handling of edge cases, manual audits.

#### Persona C — Customer Success / Revenue Leader
- **Goals**: protect retention; detect at-risk interactions early.
- **Key pains**: limited visibility into sentiment drivers; late signals of churn risk.

### 2.3 User Needs Analysis (From MRD)

Critical unmet needs:

- faster and more consistent triage/routing
- accurate answers grounded in an approved KB
- explicit uncertainty handling (clarifying questions rather than guessing)
- predictable and context-preserving escalation to humans
- closed-loop KB improvement proposals

Adoption barriers:

- trust concerns and fear of losing human access [MRD Source 8]
- knowledge management readiness (stale/incomplete KB)
- compliance/privacy constraints around PII

### 2.4 Competitive Landscape (From MRD)

Competes indirectly with:

- helpdesk suites with embedded AI features
- messaging automation platforms
- vendor copilots

Differentiation: orchestration + governance + evidence-first outputs (not “just a chatbot”).

---

## 3. Technical Requirements & Architecture

### 3.1 CrewAI Framework Specifications

**Execution mode (MVP)**:

- **Process**: sequential (determinism and easier evaluation)
- **Max iterations**: bounded to prevent runaway conversations (tune in build)
- **Memory**: off by default for reproducibility; “session memory” limited to the current conversation (persisted memory is P1/P2)
- **Human-in-the-loop**: mandatory for high-risk actions; escalation packet is the handoff artifact

**Core orchestration principles**

- “Retrieve evidence first, then generate.”
- “If evidence is missing or confidence is low, ask clarifying questions or escalate.”
- “Never fabricate policy; cite KB sources used.”

### 3.2 Core Agent Definitions (MVP)

> These are **product-level agent definitions**. Build implementation must map them to CrewAI YAML agent/task configuration.

1. **Triage Agent**
   - **role**: classify intent + urgency + risk category; choose next agent
   - **outputs**: `intent`, `priority`, `risk_flags`, `routing_decision`

2. **Knowledge Retriever Agent**
   - **role**: retrieve top-k KB snippets with citations
   - **outputs**: `evidence_pack` (citations, excerpts, confidence)

3. **Sentiment & Tone Agent**
   - **role**: analyze sentiment; recommend response tone and escalation thresholds
   - **outputs**: `sentiment_score`, `tone_guidance`, `escalation_recommendation`

4. **Resolution Agent**
   - **role**: draft response grounded in evidence_pack; ask clarifying questions when needed
   - **outputs**: `draft_answer`, `required_clarifications`, `citations_used`, `confidence`

5. **Escalation Manager Agent**
   - **role**: produce a context-preserving escalation packet for humans/tools
   - **outputs**: `escalation_packet` (summary, attempted steps, evidence, suggested next steps, risk flags)

6. **KB Improvement Agent (post-interaction)**
   - **role**: propose KB updates/FAQ drafts for gaps found; requires human approval
   - **outputs**: `kb_change_proposal` (new/updated article draft, rationale, sources, confidence)

### 3.3 Integration Requirements (MVP vs future)

**MVP (P0)**:

- No helpdesk API integration.
- Produce **helpdesk-ready artifacts** (JSON + markdown) suitable for copy/paste into any tool.

**P1**:

- Optional integration with one helpdesk system (Zendesk/Freshdesk/ServiceNow/JSM) for ticket create/update.

**External services (MVP)**:

- LLM provider (configurable via environment variables)
- Vector store / embedding model for KB retrieval

### 3.4 Data, Storage, and Security (product requirements)

- **PII minimization**: store only what is required for run logs and evaluation; redact where possible.
- **Data retention**: configurable retention policy; default “minimal” for capstone.
- **Auditability**: all responses log citations used and escalation triggers.

### 3.5 Performance & scalability targets (conceptual)

- **P95 “first meaningful response”**: ≤ 10 seconds (includes triage + retrieval + first draft)
- **Concurrent sessions**: 50–200 (capstone target)
- **Availability (demo)**: best-effort; **Productized target**: 99.9% uptime

---

## 4. Functional Requirements

### Core Features (Priority P0)

#### P0-F1: Multi-channel Intake (Web Chat, Email, WhatsApp)

- **User story**: As a support operator, I can ingest a customer inquiry from chat/email/WhatsApp into a unified conversation object so that the crew can triage and respond consistently across channels.
- **Acceptance criteria**
  - Inputs include: `channel`, `customer_message`, `customer_identifier` (optional), `thread_id` (optional), `timestamp`.
  - System normalizes messages into a single internal schema used by agents.
  - System supports English (EN) in MVP.

#### P0-F2: Intent Triage + Risk Classification

- **User story**: As a support operator, I want each inquiry classified by intent and risk so that routing and escalation are consistent.
- **Acceptance criteria**
  - Output includes: `intent_label`, `priority` (low/med/high), and `risk_flags` (e.g., billing_dispute, legal, security, data_privacy, harassment).
  - If `risk_flags` include legal/security, system recommends escalation and does not attempt high-risk resolution.
  - Classification produces a confidence score and is logged.

#### P0-F3: Knowledge Retrieval (RAG) with Citations

- **User story**: As a user, I want answers grounded in official documentation so I can trust the result.
- **Acceptance criteria**
  - Retriever returns top-k KB items with unique identifiers and excerpts.
  - Resolution output includes citations referencing KB item identifiers.
  - If no relevant KB evidence is found above a threshold, the system asks clarifying questions or escalates (no guessing).

#### P0-F4: Evidence-grounded Response Drafting + Clarifying Questions

- **User story**: As a support operator, I want the system to draft a response that is accurate, policy-compliant, and appropriately toned.
- **Acceptance criteria**
  - Response contains: concise steps, links/refs to KB, and a clear “next step” question when needed.
  - Tone guidance is applied (e.g., more empathetic when negative sentiment is detected).
  - Response includes a visible confidence indicator (low/med/high) for the operator (UI) or logs (API).

#### P0-F5: Safe Escalation with Context Packet

- **User story**: As a human agent, I need a clear summary of what happened so I can resolve issues without asking the customer to repeat themselves.
- **Acceptance criteria**
  - Escalation packet includes:
    - conversation summary (<= 10 bullets)
    - customer request in one sentence
    - intent/risk flags + sentiment
    - KB evidence consulted
    - actions attempted and why they failed
    - recommended next actions for the human agent
  - Escalation triggers include: customer asks for human, low confidence, repeated failures, high-risk flags, strong negative sentiment.

#### P0-F6: Post-interaction KB Gap Detection + Proposal Draft

- **User story**: As a knowledge manager, I want the system to suggest KB improvements to reduce future escalations.
- **Acceptance criteria**
  - Generates a KB proposal only when: missing evidence, repeated clarifying questions, or unresolved interaction.
  - Proposal is marked “draft” and requires human approval.
  - Proposal includes: rationale, suggested article structure, and source references.

### Enhanced Features (Priority P1)

#### P1-F1: Helpdesk Integration (choose one)

- Create/update ticket via API (configurable provider).
- Map escalation_packet fields into helpdesk schema.

#### P1-F2: Persistent Customer Context (Privacy-bounded)

- Optional long-term memory keyed by `customer_identifier`, with retention and consent controls.

#### P1-F3: Operator Console + Review Workflow

- UI for: approve/modify drafts, trigger escalation, approve KB proposals, view traces and citations.

### Future Features (Priority P2)

#### P2-F1: Voice Support

- Telephony integration (CCaaS) and speech-to-text with the same orchestration and guardrails.

#### P2-F2: Proactive Support

- Detect incidents via telemetry, trigger outbound comms (requires strong compliance and opt-in).

#### P2-F3: Multimodal Support

- Accept images/video (e.g., screenshots) as evidence input for troubleshooting.

---

## 5. Non-Functional Requirements

### Performance Requirements

- **P95 first meaningful response**: ≤ 10s
- **P95 full response (including citations)**: ≤ 20s for typical KB-backed queries
- **Graceful degradation**: if retrieval fails, system should (a) notify, (b) ask clarifying question, or (c) escalate; never fabricate.

### Security & Compliance

- **PII**: redact where feasible; avoid storing full message contents beyond demo logs unless configured.
- **Transparency**: disclose AI involvement in responses (UI) and ensure easy access to human escalation (mandatory).
- **Audit log**: store citations, confidence, escalation triggers, and risk flags for every interaction.

### Scalability & Reliability

- Support 50–200 concurrent conversations (capstone target).
- Retry and backoff for external tool calls (LLM/vector store).
- Deterministic orchestration: stable outputs for identical inputs within tolerance (tuning in build).

---

## 6. User Experience Design

### Interface Requirements

**MVP UI**:

- Single “agent workspace” page that supports:
  - paste/import inquiry (choose channel)
  - view triage output (intent, risk, sentiment)
  - view retrieved evidence (citations)
  - view/edit response draft
  - trigger escalation packet generation
  - export artifacts (markdown + JSON)

### Agent Interaction Design

- **Human-agent communication**: system asks clarifying questions when evidence is missing; provides short, actionable steps.
- **Feedback**: operator can mark outcome: resolved / escalated / unresolved.
- **Explainability**: show “why we routed/escalated” using intent/risk/sentiment signals and confidence thresholds.

---

## 7. Success Metrics & KPIs

### Business Metrics (aligned to MRD)

- **Containment/deflection rate** (target range for MVP evaluation): 30–60% on a curated test set (varies by KB quality)
- **Escalation rate**: track by reason (risk, low confidence, negative sentiment)
- **Estimated cost-to-serve reduction**: modeled from containment + AHT reduction (capstone model)

### Technical Metrics

- **Grounding rate**: % responses with valid KB citations (target: ≥ 90% for non-escalated responses)
- **Hallucination incidents**: 0 tolerated in “policy answer without citation” category
- **Latency**: P50/P95 for triage, retrieval, and final response
- **Tool reliability**: retrieval success rate, vector store availability

### User Experience Metrics

- **Operator usefulness rating** (thumbs up/down or 1–5): on response drafts and escalation packets
- **Time-to-value**: time from input → draft answer

---

## 8. Implementation Strategy

### Development Phases

#### Phase 1 (MVP)

- Implement core crew flow: intake → triage → retrieve → draft → (optional) escalate → kb proposal
- Implement artifact exports: markdown + JSON
- Add safety policy rules, thresholds, and audit logs
- Implement a minimal UI for operator review

#### Phase 2 (Enhanced)

- Add one helpdesk integration (ticket create/update)
- Add operator review workflows (KB approvals, response templates)
- Add persistent context (opt-in) and stronger compliance controls

#### Phase 3 (Scale)

- Add voice + multimodal (if desired)
- Add proactive support and analytics dashboards
- Production-grade governance (SSO/RBAC, retention, audit exports)

### Resource Requirements (capstone)

- 1 full-stack engineer (4–8 weeks) for MVP
- Optional: 0.25 PM/UX for evaluation design and acceptance tests

### Risk Mitigation

- **Trust gap**: always allow human escalation; disclose AI; show citations; never hide uncertainty [MRD Source 8].
- **KB readiness**: start with a curated KB set and a KB improvement loop [MRD Sections 2–3].
- **Safety**: implement risk flags and “no-guess” policy for high-risk topics.

---

## 9. Launch & Go-to-Market Strategy

### Beta Testing Plan

- **Beta users**: 3–5 operators (simulated or real support practitioners)
- **Test set**: 30–100 scripted scenarios covering:
  - common FAQs
  - account access
  - billing disputes (high risk)
  - security/privacy questions (must escalate)
  - negative sentiment interactions
  - missing KB scenarios (must ask/escalate)
- **Success criteria**:
  - ≥ 90% of non-escalated responses cite KB
  - escalation packets judged “useful” by operators in ≥ 80% of cases
  - no high-risk answer produced without escalation

### Market Launch Strategy (conceptual)

- Position as “agentic orchestration layer” for multi-channel support with trust-first controls.
- Initial packaging: operator console + artifact outputs; integrations as add-ons.

### Success Criteria

- MVP can run end-to-end reliably on a fixed scenario suite.
- Downstream build agents can implement without additional product clarifications (except Open Questions below).

---

## Quality Assurance Checklist

- [ ] All requirements traceable to MRD findings and sources in `project-context/1.define/mrd.md`  
- [ ] Technical specifications feasible with CrewAI sequential orchestration  
- [ ] MVP scope includes web chat + email + WhatsApp intake and helpdesk-ready artifacts  
- [ ] Trust and safety mechanisms are explicit (citations, confidence, escalation)  
- [ ] Success metrics defined for containment, grounding rate, and escalation correctness  
- [ ] Risk mitigation addresses hallucination and customer trust concerns  

---

## Sources

Primary context:

- MRD: `project-context/1.define/mrd.md`

External citations are referenced via the MRD “Sources (expanded)” list and should be treated as the authoritative source index for this PRD.

---

## Assumptions

- MVP helpdesk integration is **not implemented**; artifacts are produced for manual copy/paste.
- Knowledge base corpus exists (20–50 articles minimum) and is curated for the demo.
- English-only (EN) in MVP.
- WhatsApp in MVP may be simulated unless later integrated via WhatsApp Business Platform APIs.

---

## Open Questions

1. What is the **KB source** for MVP (markdown files in repo, Notion export, Confluence, Help Center export)?
2. For WhatsApp in MVP: **simulation-only** vs **real WhatsApp Business Platform integration later**?
3. What compliance constraints must be assumed for the capstone (GDPR/LGPD/other), if any?
4. Is the deployment expectation a **single-tenant local demo** or **conceptual multi-tenant SaaS**?

---

## Audit

- **Timestamp**: 2026-05-03  
- **Persona**: `@product-mgr`  
- **Action**: Created PRD at `project-context/1.define/prd.md`, structured per `recruitment-assistant/.cursor/templates/prd-template.md`, using `aamad-crewia/project-context/1.define/mrd.md` as primary context.  

