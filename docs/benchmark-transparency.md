# Benchmark and data-quality transparency

## Reference benchmark freshness and provenance

The price detail benchmark card displays the observation timestamp and provider
only when the independent benchmark API reports them. Observations older than
two minutes are labelled stale; a missing pair-matched observation is shown as
unavailable, not replaced with the aggregate price. Benchmark data remains
read-only and never contributes to the displayed aggregate.

The frontend expects `GET /api/reference-price?pair=<asset-pair>` to return an
array of pair-scoped observations:

```json
{
  "pair": "XLM/USD",
  "timestamp": "2026-10-15T18:45:00.000Z",
  "price": 0.31,
  "source": "reference-provider"
}
```

`pair`, a parseable ISO-8601 `timestamp`, and finite `price` are required.
`source` is optional; if omitted, the UI says that provenance was not reported.
The frontend filters observations to the requested pair. The backend must add
pair scoping and source provenance if its current endpoint does not provide
them; the frontend does not infer either value.
