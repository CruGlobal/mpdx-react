# Safety Nets CLI

Calibrates thresholds for the MPDX production RUM monitors, which live in
`cru-terraform applications/mpdx/web-react/datadog.tf`. Static thresholds rather
than anomaly detection, which isn't available on this Datadog account — so the
baseline has to be resampled by hand.

## Usage

```bash
yarn calibrate-safety-nets | pbcopy
```

Requires `DATADOG_API_KEY` and `DATADOG_APP_KEY` (with `rum_apps_read`
permission) in the environment or `.env.local`

It reads 28 days of RUM history and prints an HCL block on **stdout**. Copy the
HCL and replace the `rum_thresholds` block in `cru-terraform` and open a PR.

Rerun and re-paste whenever a signal's query, window, or threshold config
changes in `lib/signals.ts`, whenever thresholds go stale (RUM traffic patterns
drift over months), and once ~2 weeks of GraphQL error data exists (see
caveats).

## Known caveats

- **Browser RUM only.** A backend-only incident with no client-visible symptom
  won't trip these monitors.
- **Zero-traffic windows never alert.** The monitors set
  `notify_no_data = false`, so an outage that stops RUM events entirely trips
  nothing here.
- **`failedApi` has no GraphQL history yet.** The instrumentation that tags RUM
  errors with `@context.mpdxErrorType` merged 2026-08-10, so a baseline taken
  before ~2026-08-24 sees only `@type:resource @resource.status_code:>=500` — a
  handful of events per month — and the `minCritical` floor effectively is the
  threshold.
- **LCP has a strong daily cycle** (~2.7s troughs to ~6.1s peaks per 2h p75
  bucket, measured 2026-08-07). Thresholds come from one global percentile over
  28 days, so `perf` carries headroom above the recurring daily peaks — which
  also means a regression that stays under the morning peak is invisible. If the
  perf monitor trips at a consistent time of day, suspect miscalibration before
  regression.
- **Alerting is email, not paging.** Critical breaches notify
  `local.rum_alert_handle` in `datadog.tf`; warnings are visible in Datadog but
  notify no one.
