import { describe, expect, it } from 'vitest'
import { buildExcludedSourceAnnotations } from './qualityIncidents'

describe('buildExcludedSourceAnnotations', () => {
  it('marks only history points with reported excluded-source metadata', () => {
    const annotations = buildExcludedSourceAnnotations([
      { price: 10, timestamp: 1000, confidence: 0.9, sources: ['chainlink'] },
      {
        price: 11,
        timestamp: 2000,
        confidence: 0.8,
        sources: ['chainlink'],
        excludedSources: [
          { source: 'band', reportedPrice: 15, reason: 'outlier' },
          { source: 'reflector', reportedPrice: 12, reason: 'low confidence' },
        ],
      },
    ])

    expect(annotations).toHaveLength(1)
    expect(annotations[0]).toMatchObject({
      id: 'excluded-source-2000',
      timestamp: 2000,
      label: 'Source excluded',
      kind: 'quality',
    })
    expect(annotations[0].note).toContain('band: outlier (reported 15)')
    expect(annotations[0].note).toContain('reflector: low confidence (reported 12)')
  })

  it('returns no markers when the API provides no incident metadata', () => {
    expect(buildExcludedSourceAnnotations([])).toEqual([])
    expect(buildExcludedSourceAnnotations([{ price: 1, timestamp: 0, confidence: 1, sources: [] }])).toEqual([])
  })
})
