import { describe, expect, it } from 'vitest'
import type { Alert, AlertHistoryEntry } from '../types'
import { buildAlertDigest } from './alertDigest'

function makeAlert(id: string, active = true): Alert {
  return {
    id,
    assetPair: `${id}/USD`,
    upperThreshold: 10,
    lowerThreshold: null,
    triggerOnce: false,
    fireCount: 1,
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
    active,
    createdAt: 0,
    lastTriggeredAt: null,
  }
}

function makeHistory(alertId: string, triggeredAt: number): AlertHistoryEntry {
  return {
    id: `history-${alertId}-${triggeredAt}`,
    alertId,
    assetPair: `${alertId}/USD`,
    triggeredAt,
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

describe('buildAlertDigest', () => {
  it('limits a per-rule summary to that rule and the selected time window', () => {
    const now = 10 * 24 * 60 * 60 * 1000
    const payload = buildAlertDigest(
      [
        makeHistory('rule-a', now - 60_000),
        makeHistory('rule-b', now - 60_000),
        makeHistory('rule-a', now - 8 * 24 * 60 * 60 * 1000),
      ],
      [makeAlert('rule-a'), makeAlert('rule-b')],
      'daily',
      now,
      'rule-a',
    )

    expect(payload.ruleId).toBe('rule-a')
    expect(payload.fired.map((entry) => entry.alertId)).toEqual(['rule-a'])
    expect(payload.active.map((entry) => entry.alertId)).toEqual(['rule-a'])
  })

  it('preserves the all-alert digest behavior when no rule is selected', () => {
    const payload = buildAlertDigest(
      [makeHistory('rule-a', 9_999), makeHistory('rule-b', 9_998)],
      [makeAlert('rule-a'), makeAlert('rule-b', false)],
      'weekly',
      10_000,
    )

    expect(payload).not.toHaveProperty('ruleId')
    expect(payload.fired).toHaveLength(2)
    expect(payload.active.map((entry) => entry.alertId)).toEqual(['rule-a'])
  })
})
