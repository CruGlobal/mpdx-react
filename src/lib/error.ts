export const getErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

/** Errors deliberately ignored by Rollbar and Datadog error reporting */
export const suppressedErrorPatterns = [
  // Deployed builds report minified React errors instead of full messages
  // "Hydration failed because the initial UI does not match..."
  'Minified React error #418',
  // "There was an error while hydrating..."
  'Minified React error #423',
  // "Text content does not match server-rendered HTML"
  'Minified React error #425',
];
