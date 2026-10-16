# Portfolio analytics

The `/portfolio` page lets a user enter asset-pair holdings and amount held in
the base asset. Positions are stored locally in this browser only; the feature
does not connect a wallet, synchronize an account, or send holdings to the API.

Base exposure is grouped as held units. Quote exposure and total value include
only holdings with a fresh aggregate price. Prices older than two minutes,
future-dated prices, and missing prices are explicitly marked stale or
unavailable and excluded from quote-value totals. A failed refresh does not
turn stale data into a current valuation.

## API dependencies for advanced previews

Provider outage impact and historical aggregation-threshold recalculation need
data not currently provided by the frontend API. In particular, historical
price entries contain only aggregate price, confidence, and contributing
source names; they do not include per-provider observations, aggregation mode,
or the threshold parameters used at that timestamp. The interface must not
infer a simulated historical price from that summary. A future API contract
should expose validated per-source historical observations and the effective
aggregation configuration (or a server-side threshold simulation endpoint).
Likewise, a quantitative outage-price estimate needs source-level prices and
the aggregation rule, not just provider membership.
