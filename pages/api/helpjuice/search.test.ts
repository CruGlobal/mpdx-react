import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import proxySearchParent from './search.page';

describe('/api/helpjuice/search', () => {
  const searchTerm = 'contacts';
  const { req, res } = createMocks({
    method: 'GET',
    url: '/api/helpjuice/search',
    query: { query: searchTerm },
  });

  beforeEach(() => {
    jest.resetModules();
    process.env.HELPJUICE_ORIGIN = 'https://fake-helpjuice.com';
  });

  it('should add the parent category', async () => {
    process.env.HELPJUICE_PARENT_CATEGORY = '1234';

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn(),
    });

    await proxySearchParent(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse,
    );

    expect(res._getStatusCode()).toEqual(200);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.HELPJUICE_ORIGIN}/search?query=${searchTerm}&parent_category=${process.env.HELPJUICE_PARENT_CATEGORY}`,
    );
  });

  it('should not add the parent category', async () => {
    process.env.HELPJUICE_PARENT_CATEGORY = '';

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn(),
    });

    await proxySearchParent(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse,
    );

    expect(res._getStatusCode()).toEqual(200);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.HELPJUICE_ORIGIN}/search?query=${searchTerm}`,
    );
  });

  it('should return search results', async () => {
    process.env.HELPJUICE_PARENT_CATEGORY = '1234';

    const searchResults = [
      {
        question: {
          category_id: '4567',
          account_id: '1111',
          tag_names: [],
          answer_sample: 'Some sample',
        },
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue(searchResults),
    });

    await proxySearchParent(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse,
    );

    expect(res._getStatusCode()).toEqual(200);
    expect(res._getJSONData()).toEqual(searchResults);
  });
});
