import { describe, expect, it, vi } from 'vitest'
import type { PriceData } from '../types'
import type { PriceResyncProgress } from '../types/realtime'
import { resynchronizePrices } from './priceResync'

function price(assetPair: string): PriceData {
  return { assetPair, price: 1, timestamp: 100, confidence: 1, sources: ['test'] }
}

describe('resynchronizePrices', () => {
  it('reports incremental progress as real pair refreshes complete', async () => {
    const progress: PriceResyncProgress[] = []
    const refreshed: string[] = []
    const pending = new Map<string, (value: PriceData) => void>()

    const work = resynchronizePrices({
      pairs: ['BTC/USD', 'ETH/USD'],
      refresh: (pair) => new Promise((resolve) => pending.set(pair, resolve)),
      onPrice: (pair) => refreshed.push(pair),
      onProgress: (snapshot) => progress.push(snapshot),
      now: () => 50,
    })

    expect(progress[0]).toMatchObject({ status: 'syncing', total: 2, completed: 0 })
    pending.get('BTC/USD')?.(price('BTC/USD'))
    await vi.waitFor(() => expect(progress[progress.length - 1]?.completed).toBe(1))
    expect(refreshed).toEqual(['BTC/USD'])

    pending.get('ETH/USD')?.(price('ETH/USD'))
    await work
    expect(progress[progress.length - 1]).toMatchObject({
      status: 'complete',
      completed: 2,
      failed: 0,
      startedAt: 50,
    })
  })

  it('reports partial failure and preserves the count of successful refreshes', async () => {
    const progress: PriceResyncProgress[] = []
    const refreshed: string[] = []

    await resynchronizePrices({
      pairs: ['BTC/USD', 'ETH/USD'],
      refresh: async (pair) => {
        if (pair === 'ETH/USD') throw new Error('offline')
        return price(pair)
      },
      onPrice: (pair) => refreshed.push(pair),
      onProgress: (snapshot) => progress.push(snapshot),
    })

    expect(refreshed).toEqual(['BTC/USD'])
    expect(progress[progress.length - 1]).toMatchObject({ status: 'partial', total: 2, completed: 2, failed: 1 })
  })

  it('does not report stale results after invalidation and handles no tracked pairs', async () => {
    const onProgress = vi.fn()
    await resynchronizePrices({
      pairs: [],
      refresh: async () => price('unused'),
      onPrice: vi.fn(),
      onProgress,
    })
    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ status: 'complete', total: 0 }))

    await resynchronizePrices({
      pairs: ['BTC/USD'],
      refresh: async () => price('BTC/USD'),
      onPrice: vi.fn(),
      onProgress,
      isCurrent: () => false,
    })
    expect(onProgress).toHaveBeenCalledTimes(1)
  })
})
