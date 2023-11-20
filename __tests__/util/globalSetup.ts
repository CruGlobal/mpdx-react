const globalSetup = (): void => {
  process.env.TZ = 'UTC';
  process.env.JWT_SECRET = 'test-environment-key';
  process.env.HS_CONTACTS_CONTACT_SUGGESTIONS = 'ContactArticleId';
};

export default globalSetup;
