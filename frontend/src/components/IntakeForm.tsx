/**
 * IntakeForm — Idle view
 * Spec §6.1: channel selector + customer message textarea → triggers SUBMIT
 * SAD traceability: §8.1 (canonical intake schema), §9.1 (POST /api/runs)
 */
import { useState } from 'react'
import type { RunInput, Channel } from '../types/run'

type Props = {
  onSubmit: (input: RunInput) => void
  disabled?: boolean
}

const CHANNELS: { value: Channel; label: string }[] = [
  { value: 'web_chat', label: 'Web Chat' },
  { value: 'email',    label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp (simulated)' },
]

export default function IntakeForm({ onSubmit, disabled = false }: Props) {
  const [channel, setChannel] = useState<Channel>('web_chat')
  const [message, setMessage] = useState('')
  const [touched, setTouched]  = useState(false)

  const messageError =
    touched && message.trim().length < 10
      ? 'Message must be at least 10 characters.'
      : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (message.trim().length < 10) return
    onSubmit({ channel, customer_message: message.trim() })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5"
      aria-label="Customer inquiry submission form"
    >
      <div>
        <h2 className="text-base font-semibold text-gray-800">New Support Run</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Submit a customer inquiry to the multi-agent support crew.
        </p>
      </div>

      {/* Channel selector */}
      <div className="space-y-1">
        <label htmlFor="channel" className="block text-sm font-medium text-gray-700">
          Channel
        </label>
        <select
          id="channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value as Channel)}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Customer message */}
      <div className="space-y-1">
        <label htmlFor="customer_message" className="block text-sm font-medium text-gray-700">
          Customer Message
        </label>
        <textarea
          id="customer_message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => setTouched(true)}
          disabled={disabled}
          rows={6}
          maxLength={2000}
          placeholder="Paste the customer's message here…"
          aria-describedby={messageError ? 'message-error' : undefined}
          aria-invalid={!!messageError}
          className={`w-full rounded-lg border px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
            messageError ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between">
          {messageError ? (
            <p id="message-error" className="text-xs text-red-600" role="alert">
              {messageError}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400">{message.length}/2000</span>
        </div>
      </div>

      {/* AI disclosure */}
      <p className="text-xs text-gray-400">
        This workspace is AI-assisted. Responses are drafts — review before sending to customers.
      </p>

      <button
        type="submit"
        disabled={disabled}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
      >
        Submit to Crew
      </button>
    </form>
  )
}
