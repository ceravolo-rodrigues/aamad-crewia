/**
 * Stub services for the Support Crew run lifecycle.
 * Spec §7 — replaced by real fetch() calls in the Integration phase.
 *
 * SAD traceability: §9.1 POST /api/runs, GET /api/runs/:id
 */
import type { RunInput, StartRunResponse, RunResult } from '../types/run'

// Base URL injected via env; falls back to localhost for local dev.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// Shared counter so the stub simulates "pending → done" after a few polls.
const pollCounters: Record<string, number> = {}

// ── Stub data ─────────────────────────────────────────────────────────────────

function buildMockResult(runId: string): RunResult {
  return {
    run_id: runId,
    status: 'done',
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    latency_ms: 4320,
    triage: {
      intent_label: 'billing_inquiry',
      priority: 'medium',
      risk_flags: [],
      confidence: 0.91,
      routing_decision: 'resolve',
    },
    evidence_pack: {
      retrieval_confidence: 0.84,
      chunks: [
        {
          chunk_id: 'kb-001',
          source_title: 'Billing FAQ — Refund Policy',
          excerpt:
            'Refunds are processed within 5–7 business days after approval. Customers may request a refund within 30 days of purchase.',
          score: 0.92,
        },
        {
          chunk_id: 'kb-002',
          source_title: 'Account Management Guide',
          excerpt:
            'To update billing details, navigate to Settings → Billing → Payment Methods. Changes take effect on the next billing cycle.',
          score: 0.78,
        },
      ],
    },
    sentiment: {
      sentiment_score: -0.42,
      sentiment_label: 'negative',
      tone_guidance: 'Empathetic and reassuring. Acknowledge the inconvenience before presenting the resolution.',
      escalation_recommendation: false,
    },
    resolution: {
      draft_answer:
        'Thank you for reaching out. I understand this situation is frustrating and I\'m here to help.\n\nBased on our refund policy (kb-001), you are eligible for a refund within 30 days of purchase. Refunds are processed in 5–7 business days after approval.\n\nWould you like me to initiate the refund process for your account?',
      required_clarifications: [],
      citations_used: ['kb-001', 'kb-002'],
      confidence: 0.88,
    },
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * startRun — POST /api/runs
 * Stub: returns a fake run_id after a short simulated delay.
 * Replace with: fetch(`${API_BASE}/api/runs`, { method: 'POST', body: JSON.stringify(input) })
 */
export async function startRun(input: RunInput): Promise<StartRunResponse> {
  // TODO (integration): replace stub with real fetch
  void input // suppress unused-param warning in stub
  void API_BASE

  await new Promise((r) => setTimeout(r, 200))

  const run_id = `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  pollCounters[run_id] = 0
  return { run_id }
}

/**
 * getRunStatus — GET /api/runs/:run_id
 * Stub: returns 'running' for the first 3 polls, then 'done' with mock data.
 * Replace with: fetch(`${API_BASE}/api/runs/${runId}`)
 */
export async function getRunStatus(runId: string): Promise<RunResult> {
  // TODO (integration): replace stub with real fetch
  await new Promise((r) => setTimeout(r, 300))

  const count = (pollCounters[runId] ?? 0) + 1
  pollCounters[runId] = count

  if (count < 4) {
    return {
      run_id: runId,
      status: 'running',
      created_at: new Date().toISOString(),
    }
  }

  return buildMockResult(runId)
}
