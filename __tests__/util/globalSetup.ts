const globalSetup = (): void => {
  process.env.TZ = 'UTC';
  process.env.JWT_SECRET = 'test-environment-key';
  process.env.APP_NAME = 'MPDX';
  // Ensure we don't bypass page visibility checks in tests
  process.env.DEVELOPMENT_ENV = 'false';
};

export default globalSetup;
