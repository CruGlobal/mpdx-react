import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import stopImpersonating from 'pages/api/stop-impersonating.page';
import { clearNextAuthSessionCookies } from 'pages/api/utils/cookies';

describe('/api/stop-impersonating', () => {
  it('clears auth cookies and redirects the user', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await stopImpersonating(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse,
    );

    expect(res._getStatusCode()).toBe(302);
    expect(res._getRedirectUrl()).toBe('/');
    expect(res.getHeaders()['set-cookie']).toEqual(clearNextAuthSessionCookies);
  });
});
