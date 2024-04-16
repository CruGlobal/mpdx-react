const globalSetup = (): void => {
  process.env.TZ = 'UTC';
  process.env.JWT_SECRET = 'test-environment-key';
  process.env.SITE_URL = 'https://next.mpdx.org';
};

export default globalSetup;
