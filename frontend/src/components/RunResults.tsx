/**
 * RunResults — Done view
 * Spec §6.3: Triage card, Evidence pack, Sentiment badge, Resolution, Export row
 * SAD traceability: §7.1 (agent outputs), §8.4 (helpdesk-ready artifacts)
 */
import type { RunResult } from '../types/run'

type Props = {
  result: RunResult
  onReset: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PRIORITY_CLASSES = {
  low:    'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high:   'bg-red-100 text-red-800',
}

const SENTIMENT_CLASSES = {
  positive: 'bg-green-100 text-green-800',
  neutral:  'bg-gray-100 text-gray-700',
  negative: 'bg-red-100 text-red-800',
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`
}

function buildMarkdown(r: RunResult): string {
  const lines: string[] = [
    `# Support Run — ${r.run_id}`,
    `**Status**: ${r.status} | **Latency**: ${r.latency_ms ?? '—'}ms`,
    '',
  ]

  if (r.triage) {
    lines.push('## Triage')
    lines.push(`- **Intent**: ${r.triage.intent_label}`)
    lines.push(`- **Priority**: ${r.triage.priority}`)
    lines.push(`- **Confidence**: ${pct(r.triage.confidence)}`)
    lines.push(`- **Risk flags**: ${r.triage.risk_flags.join(', ') || 'none'}`)
    lines.push('')
  }

  if (r.resolution) {
    lines.push('## Resolution Draft')
    lines.push(r.resolution.draft_answer)
    lines.push('')
    lines.push(`*Confidence: ${pct(r.resolution.confidence)} | Citations: ${r.resolution.citations_used.join(', ')}*`)
  }

  return lines.join('\n')
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      {children}
    </section>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RunResults({ result, onReset }: Props) {
  const { triage, evidence_pack, sentiment, resolution } = result

  function handleCopyMarkdown() {
    const md = buildMarkdown(result)
    navigator.clipboard.writeText(md).catch(() => {
      // TODO: surface a toast notification on clipboard failure
    })
  }

  function handleDownloadJSON() {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `run_${result.run_id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Run meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="font-mono">Run ID: {result.run_id}</span>
        {result.latency_ms != null && <span>· {result.latency_ms}ms</span>}
        <span className="ml-auto inline-flex items-center gap-1 text-green-700 font-medium">
          <span aria-hidden>✓</span> Complete
        </span>
      </div>

      {/* Triage card */}
      {triage && (
        <Card title="Triage">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <dt className="text-xs text-gray-500">Intent</dt>
              <dd className="font-medium">{triage.intent_label}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Priority</dt>
              <dd>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_CLASSES[triage.priority]}`}>
                  {triage.priority}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Confidence</dt>
              <dd className="font-medium">{pct(triage.confidence)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Risk Flags</dt>
              <dd className="font-medium">{triage.risk_flags.length > 0 ? triage.risk_flags.join(', ') : 'None'}</dd>
            </div>
          </dl>
        </Card>
      )}

      {/* Evidence pack */}
      {evidence_pack && (
        <Card title={`Evidence Pack (${evidence_pack.chunks.length} sources · ${pct(evidence_pack.retrieval_confidence)} confidence)`}>
          <ul className="space-y-3">
            {evidence_pack.chunks.map((chunk) => (
              <li key={chunk.chunk_id} className="border border-gray-100 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">{chunk.source_title}</span>
                  <span className="text-xs text-gray-400 font-mono">{pct(chunk.score)}</span>
                </div>
                {/* Score bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${Math.round(chunk.score * 100)}%` }}
                    aria-label={`Relevance score: ${pct(chunk.score)}`}
                  />
                </div>
                <p className="text-xs text-gray-600 italic">"{chunk.excerpt}"</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Sentiment */}
      {sentiment && (
        <Card title="Sentiment & Tone">
          <div className="flex flex-wrap items-center gap-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${SENTIMENT_CLASSES[sentiment.sentiment_label]}`}>
              {sentiment.sentiment_label} ({sentiment.sentiment_score >= 0 ? '+' : ''}{sentiment.sentiment_score.toFixed(2)})
            </span>
            {sentiment.escalation_recommendation && (
              <span className="text-xs text-red-600 font-medium">⚠ Escalation recommended</span>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-2">
            <span className="font-medium">Tone guidance: </span>
            {sentiment.tone_guidance}
          </p>
        </Card>
      )}

      {/* Resolution */}
      {resolution && (
        <Card title={`Resolution Draft — ${pct(resolution.confidence)} confidence`}>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {resolution.draft_answer}
          </div>

          {resolution.required_clarifications.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Required clarifications:</p>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                {resolution.required_clarifications.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {resolution.citations_used.length > 0 && (
            <p className="text-xs text-gray-400">
              Citations: {resolution.citations_used.join(', ')}
            </p>
          )}
        </Card>
      )}

      {/* Export row */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={handleCopyMarkdown}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Copy Markdown
        </button>
        <button
          onClick={handleDownloadJSON}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Download JSON
        </button>
        <button
          onClick={onReset}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          New Run
        </button>
      </div>
    </div>
  )
}
