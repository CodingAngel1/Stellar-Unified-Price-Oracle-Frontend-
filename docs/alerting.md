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
