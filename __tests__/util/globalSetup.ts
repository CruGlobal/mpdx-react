const globalSetup = (): void => {
  process.env.TZ = 'UTC';
  process.env.JWT_SECRET = 'test-environment-key';
  process.env.APP_NAME = 'MPDX';
};

export default globalSetup;
