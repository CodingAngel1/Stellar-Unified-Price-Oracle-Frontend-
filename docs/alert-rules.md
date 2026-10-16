# Alert rule lifecycle and delivery

Expiry and review dates are optional local rule settings. An expiry date disables
the rule at the end of that calendar day in the user's local time zone; the rule
remains in the alert list and can be resumed, which clears the expired date.
Review dates only surface a due reminder in the alert panel and do not disable a
rule or send a notification. Missing live price data does not affect either
schedule.

Alert rules are stored in browser storage. These lifecycle fields are frontend
state and are not sent to an upstream API.

The alert panel supports selecting multiple non-archived rules to pause them,
change expiry/review dates, or archive them. A blank date clears that field only
when its corresponding "Change" checkbox is selected. Archived rules are retained
locally, skipped during evaluation, and can be restored paused from the Archived
tab. Restoring never silently re-enables a rule.

Before saving, the form validates locally configured channels, session-only bot
secrets, and browser notification support/permission. Email and webhook readiness
is configuration-only: the frontend does not probe remote endpoints, so an
upstream readiness/health contract is required before remote delivery can be
reported as verified.
