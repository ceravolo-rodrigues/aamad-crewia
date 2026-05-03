// SAD §8 — Data Architecture: canonical types mirroring crew artifact contracts

// SAD §8.1: Canonical intake schema
export type Channel = 'web_chat' | 'email' | 'whatsapp'

export type RunInput = {
  channel: Channel
  customer_message: string
  customer_identifier?: string
  thread_id?: string
}

// SAD §9.1: POST /api/runs response
export type StartRunResponse = {
  run_id: string
}

// SAD §8.2: Per-agent result types
export type TriageResult = {
  intent_label: string
  priority: 'low' | 'medium' | 'high'
  risk_flags: string[]
  confidence: number          // 0–1
  routing_decision: string
}

export type EvidenceChunk = {
  chunk_id: string
  source_title: string
  excerpt: string
  score: number               // 0–1
}

export type EvidencePack = {
  chunks: EvidenceChunk[]
  retrieval_confidence: number
}

export type SentimentResult = {
  sentiment_score: number     // -1.0 to 1.0
  sentiment_label: 'positive' | 'neutral' | 'negative'
  tone_guidance: string
  escalation_recommendation: boolean
}

export type ResolutionResult = {
  draft_answer: string
  required_clarifications: string[]
  citations_used: string[]    // chunk_ids
  confidence: number          // 0–1
}

// SAD §8.2: Run entity (combines all agent outputs)
export type RunStatus = 'pending' | 'running' | 'done' | 'error'

export type RunResult = {
  run_id: string
  status: RunStatus
  created_at: string
  completed_at?: string
  latency_ms?: number
  triage?: TriageResult
  evidence_pack?: EvidencePack
  sentiment?: SentimentResult
  resolution?: ResolutionResult
  error?: string
}
