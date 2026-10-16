# Live price resynchronization

After a previously live connection drops and reconnects, the Dashboard
refreshes each currently tracked price through the existing REST price
endpoint. Its status reports attempts completed, not a server-provided
percentage or sequence number.

- While requests are pending, the status reports the number checked out of the
  tracked total.
- Successful completion reports all tracked prices refreshed.
- Partial or total request failure reports how many could not be refreshed;
  last available prices remain visible and are explicitly not represented as
  newly synchronized.
- An empty tracked-pair set reports that there is nothing to refresh. Initial
  connection establishment does not trigger this reconnect-only refresh.

The progress is derived from real client REST responses and request outcomes.
No upstream progress payload or API contract change is required.
