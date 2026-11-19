export const getErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

/** Global scope key of the WeakSet of errors already reported to DataDog */
export const reportedErrorsGlobalKey = '__reportedErrors';

/** Errors deliberately ignored by Rollbar and Datadog error reporting */
export const suppressedErrorPatterns = [
  // Deployed builds report minified React errors instead of full messages
  // "Hydration failed because the initial UI does not match..."
  'Minified React error #418',
  // "There was an error while hydrating..."
  'Minified React error #423',
  // "Text content does not match server-rendered HTML"
  'Minified React error #425',
  // Cross-origin scripts (browser extensions, ad blockers, etc.) report their
  // errors to us as an opaque "Script error." with no stack — nothing in our
  // code to fix. Already excluded from the errorImpact RUM monitor's query
  // (see scripts/safety-nets/lib/signals.ts NOISE_EXCLUSION_CLAUSE); keeping
  // this in sync so the frustration-by-page monitor doesn't count these as
  // rage/error clicks either.
  'Script error',
  // A GraphQL request was cancelled (e.g. the component unmounted or the user
  // navigated away mid-request) rather than actually failing. The message
  // text varies by browser/engine. Also excluded via
  // NOISE_EXCLUSION_CLAUSE's `-@error.type:AbortError`.
  'The user aborted a request.',
  'signal is aborted without reason',
  // "ResizeObserver loop completed with undelivered notifications" /
  // "ResizeObserver loop limit exceeded" — a benign browser quirk triggered by
  // layout changes (closing a row, a modal resizing, etc.), not an
  // application bug. Already excluded from the errorImpact RUM monitor's
  // query (see scripts/safety-nets/lib/signals.ts NOISE_EXCLUSION_CLAUSE),
  // but that clause only applies to `@type:error` events — it was missing
  // here, so a burst of these on a low-traffic page could still get
  // correlated to clicks as error_click frustration events and skew the
  // frustration-by-page monitor.
  'ResizeObserver',
];
