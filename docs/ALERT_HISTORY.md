# Alert history and audit exports

The alert history in the dashboard is a browser-local record of alert events
observed by the frontend. It is not fetched from an upstream service, synced
between accounts, or independently verified by a server. No backend/API change
is required for these exports; a server-backed audit trail would require a
separate API contract and durable server-side event source.

The browser stores at most the 500 most recent entries. When the limit is
reached, older events may have been discarded. Clearing history removes the
local history and its time-series mirror. The dashboard says when browser
storage is unavailable or saved data cannot be read, rather than treating
either case as proof that no alerts fired.

## Export formats

CSV and JSON exports contain the currently filtered history entries, not
entries hidden by the asset-pair search. Both include stable event and alert
IDs, the firing time as an ISO-8601 UTC timestamp (with `Z`), price, condition,
alert type, event kind, threshold fields, and available escalation/retest
metadata. Null metadata remains empty/null instead of being inferred.

JSON wraps the records in a versioned envelope with `schemaVersion`,
`source: "browser-local"`, and `exportedAtUtc`. Export errors are announced in
the UI and do not produce a success message. The visible timestamps also use
UTC ISO-8601 so display and downloaded records have the same time basis.

The export represents the frontend's locally retained records only. It should
not be used as a complete or tamper-evident audit log.
