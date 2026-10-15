# Pair feed metadata contract

## Canonical pair units and scale

`GET /api/prices/:pair` may include `pairMetadata` on each price response:

```json
{
  "pairMetadata": {
    "baseUnit": "API-defined base unit",
    "quoteUnit": "API-defined quote unit",
    "priceScale": 8
  }
}
```

`baseUnit` and `quoteUnit` are canonical unit labels. `priceScale` is the
canonical decimal-place scale for the returned price and must be an integer
from 0 through 100. Each field may be `null` when the upstream contract cannot
establish it. The frontend displays supplied values verbatim and labels absent
or null values as unavailable; it does not derive unit semantics or scale from
pair symbols or on-chain proof precision.

The current API does not guarantee this metadata. Until the backend includes
the field, the detail page reports it as unavailable and pair cards omit the
metadata summary. No unit or scale is fabricated by the frontend.
