# Alert behavior and evidence

## Fired-alert tick evidence

Alert history records the exact aggregate tick used for evaluation: its price,
timestamp, confidence, and contributing source names. When the feed supplies
per-source tick prices, those values are recorded too. The history disclosure
shows `Not provided by the price feed` when a field is absent; the client does
not infer or reconstruct per-source prices.

Older history entries remain readable and simply have no tick-evidence
disclosure. Per-source tick values are optional in the WebSocket contract
(`sourcePrices`) and may be absent from REST snapshots, so aggregate evidence
remains available even when source-level values are not.

## Rule evaluation timeline

The alert history panel includes a keyboard-operable, expandable evaluation
timeline. It records recent live checks (up to 200 in the current page session),
including fired/matched/not-matched outcomes and skipped checks such as
inactive or snoozed rules, unavailable price ticks, percentage-baseline resets,
and cooldowns. When conditions are evaluated, each leaf check shows its actual
and expected values. Missing prices are shown as unavailable rather than
substituted with a fabricated value.

The timeline is diagnostic session state, not a durable audit log; it resets
when the page reloads or the user clears alert history.
