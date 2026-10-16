import type { PriceResyncProgress } from '../types/realtime'

export function PriceResyncStatus({ progress }: { progress: PriceResyncProgress | null | undefined }) {
  if (!progress) return null

  let message: string
  if (progress.status === 'syncing') {
    message = `Resynchronizing live prices: ${progress.completed} of ${progress.total} checked.`
  } else if (progress.status === 'complete' && progress.total === 0) {
    message = 'No tracked prices are available to resynchronize.'
  } else if (progress.status === 'complete') {
    message = `Live price resynchronization complete: ${progress.total} prices refreshed.`
  } else if (progress.status === 'failed') {
    message = `Live price resynchronization unavailable: all ${progress.total} refreshes failed. Last available prices remain displayed.`
  } else {
    message = `Live price resynchronization partially complete: ${progress.total - progress.failed} refreshed; ${progress.failed} unavailable. Last available prices remain displayed.`
  }

  return (
    <p
      className={`text-xs ${
        progress.status === 'partial' || progress.status === 'failed' ? 'text-amber-300' : 'text-gray-400'
      }`}
      role="status"
      aria-live="polite"
    >
      {message}
    </p>
  )
}
