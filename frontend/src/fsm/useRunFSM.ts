/**
 * Lightweight FSM for the support run lifecycle.
 * Spec §4 — States: idle → running → done | error → idle
 *
 * SAD traceability: §9.1 (POST /api/runs triggers running),
 *                   §7.2 (crew completes → done)
 */
import { useReducer, useCallback } from 'react'
import type { RunResult } from '../types/run'

// ── States ──────────────────────────────────────────────────────────────────

export type FSMState = 'idle' | 'running' | 'done' | 'error'

export type FSMContext = {
  runId: string | null
  result: RunResult | null
  errorMessage: string | null
}

// ── Events ───────────────────────────────────────────────────────────────────

type SubmitEvent  = { type: 'SUBMIT';  runId: string }
type SuccessEvent = { type: 'SUCCESS'; result: RunResult }
type ErrorEvent   = { type: 'ERROR';   message: string }
type ResetEvent   = { type: 'RESET' }

type FSMEvent = SubmitEvent | SuccessEvent | ErrorEvent | ResetEvent

// ── Internal state ────────────────────────────────────────────────────────────

type InternalState = {
  state: FSMState
  context: FSMContext
}

const INITIAL: InternalState = {
  state: 'idle',
  context: { runId: null, result: null, errorMessage: null },
}

// ── Reducer (pure) ────────────────────────────────────────────────────────────

function fsmReducer(current: InternalState, event: FSMEvent): InternalState {
  switch (event.type) {
    case 'SUBMIT':
      if (current.state !== 'idle') return current
      return {
        state: 'running',
        context: { runId: event.runId, result: null, errorMessage: null },
      }

    case 'SUCCESS':
      if (current.state !== 'running') return current
      return {
        state: 'done',
        context: { ...current.context, result: event.result },
      }

    case 'ERROR':
      if (current.state !== 'running') return current
      return {
        state: 'error',
        context: { ...current.context, errorMessage: event.message },
      }

    case 'RESET':
      return INITIAL

    default:
      return current
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export type UseRunFSM = {
  state: FSMState
  context: FSMContext
  submit: (runId: string) => void
  success: (result: RunResult) => void
  failure: (message: string) => void
  reset: () => void
}

export function useRunFSM(): UseRunFSM {
  const [{ state, context }, dispatch] = useReducer(fsmReducer, INITIAL)

  const submit  = useCallback((runId: string)       => dispatch({ type: 'SUBMIT',  runId }),   [])
  const success = useCallback((result: RunResult)   => dispatch({ type: 'SUCCESS', result }),   [])
  const failure = useCallback((message: string)     => dispatch({ type: 'ERROR',   message }), [])
  const reset   = useCallback(()                    => dispatch({ type: 'RESET' }),             [])

  return { state, context, submit, success, failure, reset }
}
