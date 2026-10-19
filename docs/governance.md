# Governance System & Parameter Diffs

The Governance dashboard (`/governance`) surfaces community-driven decisions, oracle parameter management, source performance, and integrity claims on the Stellar Unified Price Oracle.

## Proposed Parameter Changes & Side-by-Side Diffs (#851)

When community governance proposals propose modifications to system parameters (such as minimum active sources, deviation thresholds, heartbeat intervals, or provider weights), voters can inspect the exact changes using a side-by-side diff.

### Data Model

Proposals report proposed parameter changes via `proposedParameterChanges`:

```typescript
export interface ProposedParameterChange {
  /** Stable parameter key, e.g. "aggregator.minSources" */
  paramKey: string;
  /** Human-readable parameter label */
  paramName: string;
  /** Functional category, e.g. "aggregation", "thresholds", "weights" */
  category: string;
  /** Current value in the active registry, or null for new parameters */
  currentValue: string | null;
  /** Proposed new value if the proposal passes, or null for removals */
  proposedValue: string | null;
  /** Change classification: 'modify' | 'add' | 'remove' */
  diffType: ParameterDiffType;
  /** Rationale or governance note */
  rationale?: string | null;
  /** Measurement unit (e.g. "sources", "seconds", "%") */
  unit?: string | null;
}
```

### UI Features

- **Side-by-Side Diff View**: Side-by-side columns presenting the current registry value (highlighted with strike-through when modified or removed) against the proposed governance value.
- **Unified Diff Toggle**: An accessible view mode toggle allowing voters on mobile or narrow viewports to switch to an inline unified diff.
- **Delta Calculations**: Automatic calculation of numerical deltas and percentage changes (e.g., `+1 (+33.3%)` or `-30s (-50.0%)`).
- **Category Filtering**: Dropdown filter to inspect changes grouped by functional subsystem.
- **Explicit Missing States**: If a current parameter is not yet registered or unconfigured, the UI displays "None (new parameter)" rather than fabricating a default zero.
- **Accessibility**: Screen-reader labels (`<span className="sr-only">Old value:</span>`, `<span className="sr-only">New value:</span>`) and keyboard-operable view controls.
