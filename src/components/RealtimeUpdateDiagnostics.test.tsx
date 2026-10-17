import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { checkAccessibility } from '../test/accessibility'
import type { TickCoalescerStats } from '../utils/tickCoalescer'
import { RealtimeUpdateDiagnostics } from './RealtimeUpdateDiagnostics'

const stats: TickCoalescerStats = {
  received: 8,
  coalesced: 3,
  dropped: 1,
  flushed: 3,
  flushes: 2,
  pending: 1,
  peakPending: 2,
  coalesceRatio: 3 / 8,
  lastFlushAt: 100,
}

afterEach(cleanup)

describe('RealtimeUpdateDiagnostics', () => {
  it('explains dropped and coalesced updates with their current counts', () => {
    render(<RealtimeUpdateDiagnostics stats={stats} />)

    expect(screen.getByText('Coalesced before render')).toBeInTheDocument()
    expect(screen.getByText('Dropped at buffer limit')).toBeInTheDocument()
    expect(screen.getByText('Coalesced before render').nextElementSibling).toHaveTextContent('3')
    expect(screen.getByText('Dropped at buffer limit').nextElementSibling).toHaveTextContent('1')
  })

  it('states when metrics are unavailable and remains accessible', async () => {
    await checkAccessibility(<RealtimeUpdateDiagnostics />)
    cleanup()
    render(<RealtimeUpdateDiagnostics />)
    expect(screen.getByRole('status')).toHaveTextContent('Update metrics are unavailable.')
  })

  it('keeps the disclosure control keyboard-focusable', async () => {
    const user = userEvent.setup()
    render(<RealtimeUpdateDiagnostics stats={stats} />)
    const summary = screen.getByText('Live update handling')

    await user.tab()
    expect(summary).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(summary).toHaveFocus()
  })
})
