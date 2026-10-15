import type { ChartAnnotation } from '../components/PriceChart'
import type { PriceHistoryEntry } from '../types'

/** Converts reported historical source exclusions into immutable chart markers. */
export function buildExcludedSourceAnnotations(history: PriceHistoryEntry[]): ChartAnnotation[] {
  return history.flatMap((entry) => {
    if (!entry.excludedSources?.length) return []
    const sources = entry.excludedSources
      .map((excluded) => `${excluded.source}: ${excluded.reason} (reported ${excluded.reportedPrice})`)
      .join('; ')
    return [
      {
        id: `excluded-source-${entry.timestamp}`,
        timestamp: entry.timestamp,
        label: 'Source excluded',
        note: sources,
        color: '#f59e0b',
        kind: 'quality',
      },
    ]
  })
}
