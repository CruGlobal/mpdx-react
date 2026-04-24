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

export {};
