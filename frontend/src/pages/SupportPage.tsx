/**
 * SupportPage — single route, FSM-driven view switcher
 * Spec §3 (route map), §4 (FSM), §8 (polling strategy)
 * SAD traceability: §6 (Web/API gateway container), §9.1 (POST + GET /api/runs)
 */
import { useEffect, useRef } from 'react'
import { useRunFSM } from '../fsm/useRunFSM'
import { startRun, getRunStatus } from '../services/runService'
import IntakeForm from '../components/IntakeForm'
import LoadingSpinner from '../components/LoadingSpinner'
import RunResults from '../components/RunResults'
import type { RunInput } from '../types/run'

const POLL_INTERVAL_MS = 2_000
const POLL_TIMEOUT_MS  = 60_000

export default function SupportPage() {
  const { state, context, submit, success, failure, reset } = useRunFSM()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Polling ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state !== 'running' || !context.runId) return

    const runId = context.runId

    // Poll every 2s
    intervalRef.current = setInterval(async () => {
      try {
        const result = await getRunStatus(runId)
        if (result.status === 'done') {
          clearInterval(intervalRef.current!)
          clearTimeout(timeoutRef.current!)
          success(result)
        } else if (result.status === 'error') {
          clearInterval(intervalRef.current!)
          clearTimeout(timeoutRef.current!)
          failure(result.error ?? 'Crew returned an error.')
        }
      } catch (err) {
        clearInterval(intervalRef.current!)
        clearTimeout(timeoutRef.current!)
        failure(err instanceof Error ? err.message : 'Network error while polling.')
      }
    }, POLL_INTERVAL_MS)

    // Hard timeout after 60s
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!)
      failure('Request timed out after 60 seconds.')
    }, POLL_TIMEOUT_MS)

    return () => {
      clearInterval(intervalRef.current!)
      clearTimeout(timeoutRef.current!)
    }
  }, [state, context.runId, success, failure])

  // ── Submit handler ────────────────────────────────────────────────────────────
  async function handleSubmit(input: RunInput) {
    try {
      const { run_id } = await startRun(input)
      submit(run_id)
    } catch (err) {
      // startRun itself failed — move to error via a synthetic running→error transition
      submit('__error__')
      failure(err instanceof Error ? err.message : 'Failed to start run.')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Operator Workspace</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Submit a customer inquiry — the support crew handles triage, retrieval, and resolution.
        </p>
      </div>

      {/* idle */}
      {state === 'idle' && (
        <IntakeForm onSubmit={handleSubmit} />
      )}

      {/* running */}
      {state === 'running' && context.runId && (
        <LoadingSpinner runId={context.runId} />
      )}

      {/* done */}
      {state === 'done' && context.result && (
        <RunResults result={context.result} onReset={reset} />
      )}

      {/* error */}
      {state === 'error' && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3"
        >
          <p className="text-sm font-semibold text-red-700">Run failed</p>
          <p className="text-sm text-red-600">{context.errorMessage ?? 'An unexpected error occurred.'}</p>
          <button
            onClick={reset}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
