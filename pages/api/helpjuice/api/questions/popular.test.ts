import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import proxyPopularQuestions from './popular.page';

describe('/api/helpjuice/api/questions/popular', () => {
  const { req, res } = createMocks({
    method: 'GET',
    url: '/api/helpjuice/api/questions/popular',
  });

  beforeEach(() => {
    jest.resetModules();
    process.env.HELPJUICE_ORIGIN = 'https://fake-helpjuice.com';
  });

  it('should add the category id', async () => {
    process.env.HELPJUICE_CATEGORY_ID = '1234';

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn(),
    });

    await proxyPopularQuestions(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse,
    );

    expect(res._getStatusCode()).toEqual(200);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.HELPJUICE_ORIGIN}/api/questions/popular?category_id=${process.env.HELPJUICE_CATEGORY_ID}`,
    );
  });

  it('should not add the category id', async () => {
    process.env.HELPJUICE_CATEGORY_ID = '';

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn(),
    });

    await proxyPopularQuestions(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse,
    );

    expect(res._getStatusCode()).toEqual(200);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.HELPJUICE_ORIGIN}/api/questions/popular`,
    );
  });

  it('should return popular questions', async () => {
    process.env.HELPJUICE_CATEGORY_ID = '1234';

    const popularQuestions = [
      {
        id: '4567',
        name: 'Some Name',
        answer: 'Some answer',
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue(popularQuestions),
    });

    await proxyPopularQuestions(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse,
    );

    expect(res._getStatusCode()).toEqual(200);
    expect(res._getJSONData()).toEqual(popularQuestions);
  });
});
