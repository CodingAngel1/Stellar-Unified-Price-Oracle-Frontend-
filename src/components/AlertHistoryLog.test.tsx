import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AlertHistoryEntry } from '../types'
import { checkAccessibility } from '../test/accessibility'
import { useAlerts } from '../hooks/useAlerts'
import { loadExportUtils } from '../utils/deferredExports'
import * as exportUtils from '../utils/export'
import type { AlertsContextType } from '../types'
import { AlertHistoryLog } from './AlertHistoryLog'

vi.mock('../hooks/useAlerts', () => ({ useAlerts: vi.fn() }))
vi.mock('../utils/deferredExports', () => ({ loadExportUtils: vi.fn() }))
vi.mock('../services/alertHistory', () => ({ HISTORY_LIMIT: 500 }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const entry: AlertHistoryEntry = {
  id: 'event-1',
  alertId: 'alert-1',
  assetPair: 'BTC/USD',
  triggeredAt: Date.UTC(2026, 0, 2, 3, 4, 5),
  price: 50000,
  triggerOnce: false,
  percentageMode: false,
  upperThreshold: 49000,
  lowerThreshold: null,
  percentageThreshold: null,
  percentageWindow: null,
  percentageDirection: null,
  escalation: null,
  retest: null,
}

const mockDownload = vi.fn()
vi.spyOn(exportUtils, 'downloadFile').mockImplementation(mockDownload)

function createAlertsContext(
  history: AlertHistoryEntry[],
  status: AlertsContextType['alertHistoryStatus'],
): AlertsContextType {
  return {
    alerts: [],
    addAlert: vi.fn(),
    updateAlert: vi.fn(),
    removeAlert: vi.fn(),
    getAlertsForPair: vi.fn(() => []),
    hasAlertsForPair: vi.fn(() => false),
    activeCount: 0,
    isPanelOpen: true,
    togglePanel: vi.fn(),
    markAsRead: vi.fn(),
    snoozeAlert: vi.fn(),
    unsnoozeAlert: vi.fn(),
    reEnableAlert: vi.fn(),
    alertHistory: history,
    alertHistoryStatus: status,
    clearAlertHistory: vi.fn(),
    alertCreateAllowed: true,
    alertCreateCooldownSec: 0,
  }
}

function setHistory(history: AlertHistoryEntry[], status: AlertsContextType['alertHistoryStatus'] = 'ready'): void {
  vi.mocked(useAlerts).mockReturnValue(createAlertsContext(history, status))
}

describe('AlertHistoryLog', () => {
  beforeEach(() => {
    setHistory([entry])
    vi.mocked(loadExportUtils).mockResolvedValue(exportUtils)
    mockDownload.mockClear()
  })

  it('shows timestamps in explicit UTC ISO format and explains local retention', () => {
    render(<AlertHistoryLog />)
    expect(screen.getByText('2026-01-02T03:04:05.000Z')).toHaveAttribute('dateTime', '2026-01-02T03:04:05.000Z')
    expect(screen.getByText(/Stored only in this browser/)).toBeInTheDocument()
  })

  it('exports JSON with an accessible success announcement', async () => {
    const user = userEvent.setup()
    render(<AlertHistoryLog />)
    await user.click(screen.getByRole('button', { name: 'Export JSON' }))
    await waitFor(() =>
      expect(mockDownload).toHaveBeenCalledWith(
        expect.stringContaining('"source": "browser-local"'),
        expect.stringMatching(/^alert-history.*\.json$/),
        'application/json',
      ),
    )
    expect(await screen.findByRole('status')).toHaveTextContent('Alert history export is ready.')
  })

  it('exports only the searched history and exposes a disabled loading state', async () => {
    const user = userEvent.setup()
    const otherEntry = { ...entry, id: 'event-2', alertId: 'alert-2', assetPair: 'ETH/USD' }
    setHistory([entry, otherEntry])
    const csvRowsSpy = vi.spyOn(exportUtils, 'alertHistoryToCsvRows')
    let resolveExport: (module: typeof exportUtils) => void = () => {}
    vi.mocked(loadExportUtils).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveExport = resolve
      }),
    )
    render(<AlertHistoryLog />)
    await user.type(screen.getByRole('searchbox'), 'BTC')
    await user.click(screen.getByRole('button', { name: 'Export CSV' }))

    expect(screen.getByRole('status')).toHaveTextContent('Preparing alert history export')
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled()
    resolveExport(exportUtils)
    await waitFor(() => expect(csvRowsSpy).toHaveBeenCalledWith([entry]))
    expect(await screen.findByRole('status')).toHaveTextContent('Alert history export is ready.')
  })

  it('reports unavailable and corrupt history instead of showing a false empty state', () => {
    setHistory([], 'unavailable')
    const { rerender } = render(<AlertHistoryLog />)
    expect(screen.getAllByText(/Browser storage is unavailable/)).toHaveLength(1)
    expect(screen.queryByText('No alerts have fired yet')).not.toBeInTheDocument()

    setHistory([], 'error')
    rerender(<AlertHistoryLog />)
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    expect(screen.queryByText('No alerts have fired yet')).not.toBeInTheDocument()
  })

  it('announces export failures and keeps the export keyboard-operable', async () => {
    const user = userEvent.setup()
    vi.mocked(loadExportUtils).mockRejectedValueOnce(new Error('chunk load failed'))
    render(<AlertHistoryLog />)
    const exportButton = screen.getByRole('button', { name: 'Export CSV' })
    exportButton.focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('alert')).toHaveTextContent('Alert history export failed.')
    await checkAccessibility(<AlertHistoryLog />)
  })
})
