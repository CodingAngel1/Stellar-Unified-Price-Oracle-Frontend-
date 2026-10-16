# Notification digests

Alert digests use the existing email notification channel and
`/api/notifications/email` contract. Users can keep the all-alert daily or
weekly digest, configure a separate daily/weekly frequency for each alert rule,
or turn an individual rule's summary off. A per-rule message contains only that
rule's fired history within the selected window and its current active condition.

Schedules are persisted in browser IndexedDB and are best-effort client-side
schedules, not server cron jobs. A due summary is delivered when the dashboard
is open and the schedule is checked; a closed browser or unavailable email
endpoint can delay or fail delivery. The delivery history marks failed sends,
and loading/storage errors are shown in notification settings. The summary uses
the alert history and active-rule data currently held by the frontend; it does
not synthesize missing upstream prices. No API contract change is required.
