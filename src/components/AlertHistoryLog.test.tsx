import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AlertHistoryLog } from './AlertHistoryLog'

vi.mock('../hooks/useAlerts', () => ({
  useAlerts: () => ({
    alertHistory: [
      {
        id: 'with-tick',
        alertId: 'alert-1',
        assetPair: 'BTC/USD',
        triggeredAt: 1_700_000_000_100,
        price: 61_000,
        triggerOnce: false,
        percentageMode: false,
        upperThreshold: 60_000,
        lowerThreshold: null,
        percentageThreshold: null,
        percentageWindow: null,
        percentageDirection: null,
        evidence: {
          timestamp: 1_700_000_000_000,
          confidence: 0.97,
          sources: ['chainlink'],
          sourcePrices: { chainlink: 61_010 },
        },
      },
      {
        id: 'without-source-prices',
        alertId: 'alert-2',
        assetPair: 'ETH/USD',
        triggeredAt: 1_700_000_000_100,
        price: 3_000,
        triggerOnce: false,
        percentageMode: false,
        upperThreshold: 2_900,
        lowerThreshold: null,
        percentageThreshold: null,
        percentageWindow: null,
        percentageDirection: null,
        evidence: {
          timestamp: 1_700_000_000_000,
          confidence: 0.9,
          sources: [],
        },
      },
    ],
    clearAlertHistory: vi.fn(),
  }),
}))

describe('AlertHistoryLog tick evidence', () => {
  it('reveals tick facts on demand and labels feed fields that are unavailable', () => {
    render(<AlertHistoryLog />)

    const summaries = screen.getAllByText('Show exact tick evidence')
    fireEvent.click(summaries[0])

    expect(screen.getByText('chainlink: 61,010.00')).toBeInTheDocument()
    expect(screen.getByText('chainlink')).toBeInTheDocument()

    fireEvent.click(summaries[1])
    expect(screen.getAllByText('Not provided by the price feed')).toHaveLength(2)
  })
})
