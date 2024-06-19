import { getToken } from 'next-auth/jwt';
import { createMocks } from 'node-mocks-http';
import uploadTntConnect from './upload-tnt-connect-import.page';
import 'node-fetch';

jest.mock('node-fetch', () => jest.fn());

jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));
jest.mock('src/lib/apollo/ssrClient', () => jest.fn());

const accountListId = 'accountListId';
const file = new File(['contents1'], 'tnt1.xml', {
  type: 'text/xml',
});
const override = 'false';
const tag_list = 'tag1';

describe('upload-tnt-connect-import', () => {
  it('responds with error if unauthorized', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        override: override,
        file,
        tag_list,
        accountListId,
      },
    });

    await uploadTntConnect(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it('responds with error if not sent with POST', async () => {
    (getToken as jest.Mock).mockReturnValue({
      apiToken: 'accessToken',
      userID: 'sessionUserID',
    });
    const { req, res } = createMocks({
      method: 'GET',
    });

    await uploadTntConnect(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
