import type { PriceData } from '../types'
import type { PriceResyncProgress } from '../types/realtime'

interface ResynchronizePricesOptions {
  pairs: string[]
  refresh: (pair: string) => Promise<PriceData>
  onPrice: (pair: string, price: PriceData) => void
  onProgress: (progress: PriceResyncProgress) => void
  isCurrent?: () => boolean
  now?: () => number
}

/** Refreshes each tracked pair independently and reports truthful completion/failure counts. */
export async function resynchronizePrices({
  pairs,
  refresh,
  onPrice,
  onProgress,
  isCurrent = () => true,
  now = () => Date.now(),
}: ResynchronizePricesOptions): Promise<void> {
  const startedAt = now()
  if (pairs.length === 0) {
    if (isCurrent()) onProgress({ status: 'complete', total: 0, completed: 0, failed: 0, startedAt })
    return
  }

  let completed = 0
  let failed = 0
  if (isCurrent()) onProgress({ status: 'syncing', total: pairs.length, completed, failed, startedAt })

  await Promise.all(
    pairs.map(async (pair) => {
      try {
        const price = await refresh(pair)
        if (isCurrent()) onPrice(pair, price)
      } catch {
        failed += 1
      } finally {
        if (isCurrent()) {
          completed += 1
          const status =
            completed < pairs.length
              ? 'syncing'
              : failed === 0
                ? 'complete'
                : failed === pairs.length
                  ? 'failed'
                  : 'partial'
          onProgress({ status, total: pairs.length, completed, failed, startedAt })
        }
      }
    }),
  )
}
