import type { TickCoalescerStats } from '../utils/tickCoalescer'

interface RealtimeUpdateDiagnosticsProps {
  stats?: TickCoalescerStats
}

/** Human-readable renderer backpressure counters for the live price stream. */
export function RealtimeUpdateDiagnostics({ stats }: RealtimeUpdateDiagnosticsProps) {
  return (
    <details className="text-xs text-gray-400">
      <summary
        tabIndex={0}
        className="cursor-pointer rounded px-2 py-1 hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
      >
        Live update handling
      </summary>
      {!stats ? (
        <p className="px-2 py-2" role="status">
          Update metrics are unavailable.
        </p>
      ) : (
        <div className="space-y-2 px-2 py-2" role="group" aria-label="Live update handling metrics">
          <p>
            Counts since this page started. Coalesced updates were replaced by a newer price before rendering; dropped
            updates exceeded the bounded buffer and were not rendered.
          </p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
            <dt>Received</dt>
            <dd className="font-mono text-gray-200">{stats.received}</dd>
            <dt>Coalesced before render</dt>
            <dd className="font-mono text-gray-200">{stats.coalesced}</dd>
            <dt>Dropped at buffer limit</dt>
            <dd className="font-mono text-gray-200">{stats.dropped}</dd>
            <dt>Pending</dt>
            <dd className="font-mono text-gray-200">{stats.pending}</dd>
          </dl>
        </div>
      )}
    </details>
  )
}
