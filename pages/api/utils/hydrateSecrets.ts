const raw = process.env.secrets;
if (raw && raw !== '{}') {
  try {
    const parsed = JSON.parse(raw);
    process.env.JWT_SECRET ??= parsed.JWT_SECRET;
    process.env.OKTA_CLIENT_SECRET ??= parsed.OKTA_CLIENT_SECRET;
    process.env.API_OAUTH_CLIENT_SECRET ??= parsed.API_OAUTH_CLIENT_SECRET;
    process.env.ROLLBAR_SERVER_ACCESS_TOKEN ??=
      parsed.ROLLBAR_SERVER_ACCESS_TOKEN;
  } catch {
    // eslint-disable-next-line no-console
    console.error('Failed to hydrate secrets from process.env.secrets');
  }
}

// TEMPORARY — diagnostic to learn what Amplify's Lambda runtime env looks like.
// Remove after the env-var-at-runtime question is resolved. Logs only
// booleans and key names, never values. Gated to server-only via the
// `typeof window === 'undefined'` idiom that Next.js recognizes for dead-
// code elimination from the client bundle.
if (typeof window === 'undefined') {
  // eslint-disable-next-line no-console
  console.log('[hydrateSecrets:diagnostic]', {
    secrets_blob_present: !!process.env.secrets,
    JWT_SECRET_present: !!process.env.JWT_SECRET,
    OKTA_CLIENT_SECRET_present: !!process.env.OKTA_CLIENT_SECRET,
    API_OAUTH_CLIENT_SECRET_present: !!process.env.API_OAUTH_CLIENT_SECRET,
    ROLLBAR_SERVER_ACCESS_TOKEN_present:
      !!process.env.ROLLBAR_SERVER_ACCESS_TOKEN,
  });
}

export {};
