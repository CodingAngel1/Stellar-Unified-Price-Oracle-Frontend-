import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PriceContextValue } from '../context/PriceContext'
import { STORAGE_KEYS } from '../utils/storage'
import { Portfolio } from './Portfolio'

const priceContext: PriceContextValue = {
  prices: [{ assetPair: 'XLM/USD', price: 0.12, timestamp: 1_000, confidence: 0.99, sources: ['band'] }],
  pricesLoading: false,
  pricesError: null,
  pricesValidating: false,
  livePrices: new Map(),
  wsStatus: 'connected',
  rateLimitStatus: 'ok',
  rateLimitRetryAfterMs: 0,
  outboundQueued: 0,
  pricesQueued: false,
  requestsThrottled: false,
  refetchPrices: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  _emitPriceUpdate: vi.fn(),
  attributionHistory: new Map(),
  isWsLeader: null,
}

vi.mock('../context/PriceContext', () => ({
  usePriceContext: () => priceContext,
}))

describe('Portfolio', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.setSystemTime(1_000)
  })

  it('lets a keyboard user add and remove a local holding and groups exposures', async () => {
    const user = userEvent.setup()
    render(<Portfolio />)

    await user.tab()
    expect(screen.getByLabelText('Asset pair')).toHaveFocus()
    await user.type(screen.getByLabelText('Asset pair'), 'xlm/usd')
    await user.tab()
    await user.type(screen.getByLabelText('Amount held (base asset)'), '100')
    await user.tab()
    await user.keyboard('{Enter}')

    const holdingRow = await screen.findByRole('row', { name: /XLM\/USD/ })
    expect(within(holdingRow).getByText('12 USD')).toBeInTheDocument()
    expect(within(holdingRow).getByText('100 XLM')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.portfolioHoldings) ?? '[]')).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Remove XLM/USD holding' }))
    expect(screen.getByText('No holdings yet. Add an asset pair and amount to begin.')).toBeInTheDocument()
  })

  it('rejects malformed input and reports missing prices without estimating a value', async () => {
    render(<Portfolio />)
    fireEvent.change(screen.getByLabelText('Asset pair'), { target: { value: 'not a pair' } })
    fireEvent.change(screen.getByLabelText('Amount held (base asset)'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add holding' }))

    expect(screen.getByRole('alert')).toHaveTextContent('BASE/QUOTE')

    fireEvent.change(screen.getByLabelText('Asset pair'), { target: { value: 'DOGE/USD' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add holding' }))
    await waitFor(() => expect(screen.getByText('Price unavailable')).toBeInTheDocument())
    expect(screen.getAllByText('—')).toHaveLength(2)
  })
})
