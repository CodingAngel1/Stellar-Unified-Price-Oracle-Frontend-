import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { checkAccessibility } from '../test/accessibility'
import type { PriceResyncProgress } from '../types/realtime'
import { PriceResyncStatus } from './PriceResyncStatus'

function progress(status: PriceResyncProgress['status'], completed: number, failed: number, total = 3) {
  return { status, completed, failed, total, startedAt: 100 }
}

afterEach(cleanup)

describe('PriceResyncStatus', () => {
  it('announces progress while tracked prices are being refreshed', () => {
    render(<PriceResyncStatus progress={progress('syncing', 1, 0)} />)

    expect(screen.getByRole('status')).toHaveTextContent('1 of 3 checked')
  })

  it('reports unavailable refreshes without implying old prices are fresh', () => {
    render(<PriceResyncStatus progress={progress('partial', 3, 1)} />)

    expect(screen.getByRole('status')).toHaveTextContent('2 refreshed; 1 unavailable')
    expect(screen.getByRole('status')).toHaveTextContent('Last available prices remain displayed')
  })

  it('reports a successful refresh and the empty-pair state accessibly', async () => {
    await checkAccessibility(<PriceResyncStatus progress={progress('complete', 3, 0)} />)
    cleanup()
    render(<PriceResyncStatus progress={progress('complete', 0, 0, 0)} />)

    expect(screen.getByRole('status')).toHaveTextContent('No tracked prices are available')
  })
})
