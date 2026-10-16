import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Alert, AlertHistoryEntry } from '../types'
import { useAlertDigest } from './useAlertDigest'

const persist = vi.fn().mockResolvedValue(undefined)

vi.mock('./useIdbQuery', () => ({
  useIdbQuery: () => ({ data: null, loading: false, error: null }),
  useIdbMutation: () => ({ set: persist }),
}))

vi.mock('../services/notificationConfig', () => ({
  loadNotifConfig: () => ({
    email: { enabled: true, address: 'alerts@example.test' },
  }),
}))

function makeAlert(id: string): Alert {
  return {
    id,
    assetPair: `${id}/USD`,
    upperThreshold: 10,
    lowerThreshold: null,
    triggerOnce: false,
    fireCount: 0,
    percentageMode: false,
    percentageThreshold: null,
    percentageWindow: null,
    percentageDirection: null,
    percentageRelativeTo: null,
    percentageBaselinePrice: null,
    percentageBaselineTimestamp: null,
    snoozedUntil: null,
    cooldownMinutes: 0,
    conditionGroup: null,
    escalationPolicy: null,
    escalationState: null,
    channels: null,
    retestMode: false,
    retestState: null,
    active: true,
    createdAt: 0,
    lastTriggeredAt: null,
  }
}

function makeHistory(alertId: string): AlertHistoryEntry {
  return {
    id: `history-${alertId}`,
    alertId,
    assetPair: `${alertId}/USD`,
    triggeredAt: Date.now(),
    price: 12,
    triggerOnce: false,
    percentageMode: false,
    upperThreshold: 10,
    lowerThreshold: null,
    percentageThreshold: null,
    percentageWindow: null,
    percentageDirection: null,
  }
}

describe('useAlertDigest per-rule schedules', () => {
  beforeEach(() => {
    persist.mockClear()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000000')
  })

  it('persists a configurable per-rule frequency', async () => {
    const { result } = renderHook(() => useAlertDigest([makeAlert('btc')], []))

    act(() => result.current.setRuleFrequency('btc', 'daily'))

    await waitFor(() =>
      expect(persist).toHaveBeenCalledWith(
        'preferences',
        'alert-rule-digest-schedules',
        expect.objectContaining({
          btc: expect.objectContaining({ frequency: 'daily' }),
        }),
      ),
    )
    expect(result.current.ruleSchedules.btc.frequency).toBe('daily')
  })

  it('sends a manual summary containing only the selected rule', async () => {
    const alerts = [makeAlert('btc'), makeAlert('eth')]
    const history = [makeHistory('btc'), makeHistory('eth')]
    const { result } = renderHook(() => useAlertDigest(alerts, history))

    act(() => result.current.setRuleFrequency('btc', 'weekly'))
    await waitFor(() => expect(result.current.ruleSchedules.btc).toBeDefined())

    await act(async () => result.current.runRuleNow('btc'))

    const request = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(String(request[1]?.body)) as { subject: string; message: string }
    expect(body.subject).toContain('weekly')
    expect(body.message).toContain('btc/USD')
    expect(body.message).not.toContain('eth/USD')
    expect(persist).toHaveBeenCalledWith(
      'preferences',
      'alert-digest-history',
      expect.arrayContaining([expect.objectContaining({ ruleId: 'btc', ok: true })]),
    )
  })
})
