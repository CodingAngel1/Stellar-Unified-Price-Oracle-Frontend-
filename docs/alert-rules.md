# Alert rule lifecycle and delivery

Expiry and review dates are optional local rule settings. An expiry date disables
the rule at the end of that calendar day in the user's local time zone; the rule
remains in the alert list and can be resumed, which clears the expired date.
Review dates only surface a due reminder in the alert panel and do not disable a
rule or send a notification. Missing live price data does not affect either
schedule.

Alert rules are stored in browser storage. These lifecycle fields are frontend
state and are not sent to an upstream API.
