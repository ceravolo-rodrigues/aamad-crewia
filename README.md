# Multi-Agent Customer Support Crew (Capstone)

This repository is a **CrewAI capstone project** scaffolded with the **AAMAD** (AI-Assisted Multi-Agent Application Development) workflow. The product theme is an **intelligent, multi-channel customer support crew**: specialized agents collaborate to triage inquiries, retrieve grounded knowledge, adapt tone to sentiment, escalate safely to humans, and propose knowledge-base improvements.

**Runtime target (Phase 2 build):** `crewai` — set `AAMAD_TARGET_RUNTIME=crewai` when implementing the backend.

---

## What you are building

Traditional helpdesks struggle with volume, inconsistent answers, and weak handoffs between channels and humans. This capstone implements a **multi-agent support pipeline** that:

- Accepts the same logical conversation across **web chat, email, and WhatsApp** (normalized intake; WhatsApp may be simulated in early MVP).
- Uses **RAG with citations** so answers stay tied to an approved knowledge base.
- Applies **sentiment-aware** guidance and **risk-based** guardrails (e.g. legal/security topics escalate instead of guessing).
- Produces **helpdesk-ready artifacts** (JSON + Markdown) for operators—even before a real ticketing API exists.
- Optionally proposes **KB draft updates** after gaps or unresolved threads (human approval required).

Design goals from Define phase: **trust**, **explainability**, **auditability**, and **deterministic orchestration** (sequential CrewAI tasks for MVP).

---

## Define-phase artifacts (source of truth)

| Artifact | Path | Role |
|----------|------|------|
| Market Research | [`project-context/1.define/mrd.md`](project-context/1.define/mrd.md) | Market drivers, personas, risks |
| Product Requirements | [`project-context/1.define/prd.md`](project-context/1.define/prd.md) | P0/P1/P2 features, acceptance criteria, NFRs |
| System Architecture | [`project-context/1.define/sad.md`](project-context/1.define/sad.md) | Containers, crew flow, data contracts, integration boundaries |

Implementation in **Build** should trace to these files. See [`CHECKLIST.md`](CHECKLIST.md) for the full Define → Build → Deliver sequence.

---

## Repository layout (capstone + AAMAD)

```
aamad-crewia/
├── .cursor/
│   ├── agents/          # Personas (@product-mgr, @backend.eng, …)
│   ├── rules/           # AAMAD + adapter rules (*.mdc)
│   ├── templates/       # MRD / PRD / SAD templates
│   └── prompts/         # Phase prompts (e.g. Define)
├── .github/agents/      # VS Code / Copilot agent definitions (optional)
├── project-context/
│   ├── 1.define/        # mrd.md, prd.md, sad.md (+ future SFS)
│   ├── 2.build/         # setup.md, frontend.md, backend.md, … (during Build)
│   └── 3.deliver/       # Deploy / QA logs (Deliver phase)
├── AGENTS.md            # Persona index and workflow bridge
├── CHECKLIST.md         # Step-by-step AAMAD execution
└── README.md            # This file
```

---

## How to work this project (quick path)

1. **Read** `project-context/1.define/mrd.md`, `prd.md`, and `sad.md`.
2. **Build** (Phase 2): follow `CHECKLIST.md` — `@project.mgr` → `@frontend.eng` / `@backend.eng` → `@integration.eng` → `@qa.eng`.
3. **Personas**: listed in [`AGENTS.md`](AGENTS.md); definitions live under `.cursor/agents/`.
4. **Rules**: `.cursor/rules/` enforce AAMAD core behavior and the **CrewAI adapter** (YAML agents/tasks, observability, guardrails).

---

## AAMAD in one paragraph

**AAMAD** is a context-first methodology: research and requirements live in `project-context/`, personas own epics, and runtime adapters (here: **CrewAI**) constrain how the MVP is implemented—not how you plan the work. This repo applies that methodology to the **customer support crew** capstone, not to a generic empty template.

If you are **bootstrapping a new empty project** with the upstream framework CLI, use the PyPI package **`aamad`** (`pip install aamad`, `aamad init --help`); this README focuses on **this capstone repository**.

---

## Environment

- **Secrets:** never commit API keys. Use `.env` / environment variables only (see `.env.example` when the Build phase adds one).
- **Runtime flag:** `AAMAD_TARGET_RUNTIME=crewai` for the generated MVP backend.

---

## Contributing & license

- **Contributing:** issues and PRs welcome for capstone scope (agents, rules, docs, implementation). If you change bundled `.cursor/` assets for publication, follow any existing `scripts/update_bundle.py` workflow noted in upstream AAMAD.
- **License:** Apache License 2.0 (see repository `LICENSE` if present; otherwise retain notices from upstream).

---

## Further reading

| Doc | Purpose |
|-----|---------|
| [`CHECKLIST.md`](CHECKLIST.md) | Ordered Define → Build → Deliver steps |
| [`AGENTS.md`](AGENTS.md) | Persona list and high-level workflow |
| `.cursor/rules/` | Non-functional and adapter constraints |
| `.cursor/templates/` | Templates for new MRD/PRD/SAD iterations |
