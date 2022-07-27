const globalSetup = (): void => {
  process.env.TZ = 'UTC';
  process.env.secrets.JWT_SECRET = 'test-environment-key';
};

export default globalSetup;
