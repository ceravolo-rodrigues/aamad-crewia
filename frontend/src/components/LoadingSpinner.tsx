/**
 * LoadingSpinner — Running view
 * Spec §6.2: shows run ID + animated spinner while polling
 * SAD traceability: §9.1 (GET /api/runs/:id polling)
 */
type Props = {
  runId: string
}

export default function LoadingSpinner({ runId }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-24"
      role="status"
      aria-live="polite"
      aria-label="Running support crew"
    >
      {/* Spinner */}
      <svg
        className="animate-spin h-12 w-12 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>

      <div className="text-center space-y-1">
        <p className="text-base font-medium text-gray-800">Running support crew…</p>
        <p className="text-xs text-gray-500 font-mono">
          Run ID: <span className="text-gray-700">{runId}</span>
        </p>
        <p className="text-xs text-gray-400">
          Triage → Retrieve → Sentiment → Resolve
        </p>
      </div>
    </div>
  )
}
