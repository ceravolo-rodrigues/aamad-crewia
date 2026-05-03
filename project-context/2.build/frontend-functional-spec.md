# Frontend Functional Specification: Multi-Agent Customer Support Crew

**Project**: Multi-Agent Customer Support Crew (Capstone)  
**Version**: 1.0  
**Date**: 2026-05-03  
**Owner**: @frontend.eng  
**Flow**: Option 1 — Single-form submission → Waiting → Full results display  
**SAD anchor**: §6 (Container View), §7 (Multi-Agent Architecture), §9 (Interface Spec)  
**Status**: MVP scaffold

---

## 1. Scope

Build a single-route React/TypeScript operator workspace that:

1. Presents a **submission form** (idle state) — channel + customer message.
2. Shows a **loading/waiting view** (running state) while polling `GET /api/runs/:id`.
3. Renders a **read-only results page** (done state) — triage, evidence pack, sentiment, resolution, export actions.

Not in scope for this spec: escalation-specific branching UI, KB improvement panel, auth, multi-tenant isolation.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 18 + TypeScript 5 | Broad ecosystem; type safety aligns with SAD artifact contracts |
| Build | Vite | Fast DX; no CRA overhead |
| Styling | Tailwind CSS v3 | Utility-first; responsive by default; quick layout iteration |
| State machine | Custom lightweight FSM hook | No Xstate dep for MVP; matches AAMAD minimal-viable-architecture rule |
| HTTP client | native `fetch` | No additional dependency; stub-friendly |
| Routing | React Router v6 (single route) | Future-extensible; single `<Route path="/" />` for MVP |

---

## 3. Route Map

| Path | Component | Description |
|---|---|---|
| `/` | `<SupportPage />` | Only route; renders one of three views based on FSM state |

---

## 4. Finite State Machine (FSM)

### 4.1 States

| State | Meaning | UI shown |
|---|---|---|
| `idle` | Awaiting operator input | Submission form |
| `running` | Crew kickoff in progress; polling | Loading spinner + run ID |
| `done` | Run complete | Results page |
| `error` | Network or crew failure | Error banner + retry |

### 4.2 Transitions

```
idle    ──SUBMIT──►  running
running ──SUCCESS──► done
running ──ERROR───►  error
done    ──RESET───►  idle
error   ──RESET───►  idle
```

### 4.3 Context fields (state payload)

```typescript
type FSMContext = {
  runId: string | null;       // populated after startRun()
  result: RunResult | null;   // populated after done
  errorMessage: string | null;
};
```

---

## 5. Data Contracts (TypeScript types)

All types trace to SAD §8 (Data Architecture).

```typescript
// Input to the crew (maps to SAD §8.1 canonical schema)
type RunInput = {
  channel: 'web_chat' | 'email' | 'whatsapp';
  customer_message: string;
  customer_identifier?: string;
  thread_id?: string;
};

// Stub response from POST /api/runs (SAD §9.1)
type StartRunResponse = {
  run_id: string;
};

// Full run result (GET /api/runs/:id when status=done)
type RunStatus = 'pending' | 'running' | 'done' | 'error';

type TriageResult = {
  intent_label: string;
  priority: 'low' | 'medium' | 'high';
  risk_flags: string[];
  confidence: number;
  routing_decision: string;
};

type EvidenceChunk = {
  chunk_id: string;
  source_title: string;
  excerpt: string;
  score: number;
};

type EvidencePack = {
  chunks: EvidenceChunk[];
  retrieval_confidence: number;
};

type SentimentResult = {
  sentiment_score: number;   // -1.0 to 1.0
  sentiment_label: 'positive' | 'neutral' | 'negative';
  tone_guidance: string;
  escalation_recommendation: boolean;
};

type ResolutionResult = {
  draft_answer: string;
  required_clarifications: string[];
  citations_used: string[];   // chunk_ids
  confidence: number;
};

type RunResult = {
  run_id: string;
  status: RunStatus;
  created_at: string;
  completed_at?: string;
  latency_ms?: number;
  triage?: TriageResult;
  evidence_pack?: EvidencePack;
  sentiment?: SentimentResult;
  resolution?: ResolutionResult;
  error?: string;
};
```

---

## 6. Component Breakdown

```
src/
├── types/
│   └── run.ts              # All shared TS types above
├── fsm/
│   └── useRunFSM.ts        # FSM hook: state, context, dispatch
├── services/
│   └── runService.ts       # Stub: startRun(), getRunStatus()
├── components/
│   ├── IntakeForm.tsx       # Idle view: channel + message form
│   ├── LoadingSpinner.tsx   # Running view: spinner + run ID
│   └── RunResults.tsx       # Done view: all result cards + export
└── pages/
    └── SupportPage.tsx     # Root page: FSM-driven view switcher
```

### 6.1 IntakeForm
- **Inputs**: channel `<select>`, customer_message `<textarea>` (min 10 chars, max 2000)
- **Actions**: `[Submit]` → dispatches `SUBMIT`, calls `startRun()`, begins polling
- **Validation**: non-empty message; channel selected
- **Accessibility**: label + aria on all inputs

### 6.2 LoadingSpinner
- **Displays**: animated spinner, `run_id`, "Running support crew…" copy
- **Behaviour**: parent polls `getRunStatus()` every 2s; transitions to `done` or `error`

### 6.3 RunResults
- **Triage card**: intent label, priority badge (color-coded), risk flags list, confidence %
- **Evidence pack**: list of source cards — title, excerpt, score bar
- **Sentiment badge**: label + score gauge
- **Resolution**: draft answer text, confidence %, clarifications list, citations
- **Export row**: `[Copy Markdown]`, `[Download JSON]`, `[New Run]`

---

## 7. Service Stubs

Both functions are no-op stubs for MVP; replaced by real `fetch` calls in integration phase.

### 7.1 `startRun(input: RunInput): Promise<StartRunResponse>`

Returns a random `run_id` after a simulated 200ms delay.

### 7.2 `getRunStatus(runId: string): Promise<RunResult>`

Returns a canned `RunResult` with `status: 'done'` after ~4 calls (simulating polling).  
Stub includes realistic mock data for all six result fields.

---

## 8. Polling Strategy

```
1. POST /api/runs  → get run_id
2. Every 2000ms: GET /api/runs/:run_id
3. If status === 'done'  → dispatch SUCCESS, store result, clear interval
4. If status === 'error' → dispatch ERROR, store message, clear interval
5. Timeout after 60s    → dispatch ERROR('timeout')
```

---

## 9. Export Behaviour

| Action | Implementation |
|---|---|
| `[Copy Markdown]` | Builds `run_summary.md` string from result; `navigator.clipboard.writeText()` |
| `[Download JSON]` | Creates Blob of `RunResult` JSON; triggers anchor download |
| `[New Run]` | dispatches `RESET` → clears context → back to form |

---

## 10. Responsive Layout

- Mobile-first Tailwind classes
- Single column on mobile; max-w-3xl centered on desktop
- Card-based result sections; gap-4 grid

---

## 11. Non-Functional Requirements (Frontend)

| NFR | Target |
|---|---|
| First paint (idle form) | < 1s on LAN |
| Results render | Instant (all data available at once) |
| Accessible | WCAG 2.1 AA for form inputs and status announcements |
| Type errors | Zero (strict TS) |

---

## 12. Spec Sync Checklist

Update this checklist after each commit that touches frontend code.

```
SPEC SYNC — run after each commit
──────────────────────────────────────────────────────────────────
[ ] FSM states match §4 table (idle/running/done/error)
[ ] FSM transitions match §4.2 diagram (SUBMIT/SUCCESS/ERROR/RESET)
[ ] FSMContext fields (runId, result, errorMessage) present in useRunFSM.ts
[ ] RunInput type matches §5 (channel union, customer_message, optional fields)
[ ] RunResult type matches §5 (all agent output fields present)
[ ] IntakeForm validates: non-empty message, channel selected
[ ] LoadingSpinner: displays run_id and polling message
[ ] RunResults renders: triage, evidence_pack, sentiment, resolution cards
[ ] Export: Copy Markdown and Download JSON functional (or stubbed with TODO)
[ ] runService.ts stubs return data matching RunResult type
[ ] Polling: 2s interval, 60s timeout, clears interval on done/error
[ ] No hardcoded secrets or API base URLs (use VITE_API_BASE_URL env var)
[ ] Tailwind responsive: single column mobile, max-w-3xl desktop
[ ] TypeScript: zero type errors (tsc --noEmit passes)
[ ] SAD traceability: component-to-SAD-section mapping in comments present
──────────────────────────────────────────────────────────────────
Last synced: 2026-05-03 | Commit: (fill in)
```

---

## Sources

- `project-context/1.define/prd.md`: §3.2 Agent Definitions, §4 Functional Requirements, §3.5 Performance targets
- `project-context/2.build/sad.md`: §6 Container View, §7 Multi-Agent Architecture, §8 Data Architecture, §9 Interface Spec
- AAMAD Core Rules: minimal viable architecture, context-first engineering

## Assumptions

- Channel `whatsapp` is simulated (operator pastes text) per PRD/SAD assumption.
- No auth for MVP capstone demo.
- API base URL configurable via `VITE_API_BASE_URL` env var; defaults to `http://localhost:8000`.
- Polling is client-side; no WebSocket/SSE in MVP.

## Open Questions

1. Should confidence scores be shown as % or 0–1 decimal in UI?
2. Are risk flags free-text strings or a fixed enum? (affects badge colors)
3. Should the results page allow editing the draft answer before export?

## Audit

- **Timestamp**: 2026-05-03  
- **Persona**: @frontend.eng  
- **Action**: Create frontend-functional-spec.md (Option 1 — Simple Sequential Flow)  
- **SAD anchors**: §6, §7.1, §7.2, §8, §9  
- **PRD anchors**: §3.2, §4, §3.5  
- **Output path**: `project-context/2.build/frontend-functional-spec.md`
