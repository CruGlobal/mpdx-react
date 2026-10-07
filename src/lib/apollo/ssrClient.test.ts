import { ApolloLink, Observable } from '@apollo/client';
import rollbar from 'pages/api/utils/rollBar';
import { HcmDocument } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import makeSsrClient from './ssrClient';

jest.mock('pages/api/utils/rollBar', () => ({
  __esModule: true,
  default: { error: jest.fn() },
  isRollBarEnabled: true,
}));

let mockNetworkError: Error;
jest.mock('./link', () => ({
  makeAuthLink: () =>
    new ApolloLink((operation, forward) => forward(operation)),
  batchLink: new ApolloLink(
    () => new Observable((observer) => observer.error(mockNetworkError)),
  ),
}));

const makeServerError = (result: unknown) =>
  Object.assign(
    new Error('Response not successful: Received status code 500'),
    { name: 'ServerError', statusCode: 500, result },
  );

describe('makeSsrClient error link', () => {
  it.each([
    ['an object', { errors: { title: 'Internal Server Error' } }],
    ['a string', { errors: 'Internal Server Error' }],
  ])(
    'passes the network error on when the response errors are %s',
    async (_, result) => {
      mockNetworkError = makeServerError(result);

      await expect(
        makeSsrClient('token').query({
          query: HcmDocument,
          variables: { personNumber: null },
        }),
      ).rejects.toThrow('Response not successful: Received status code 500');

      expect(rollbar.error).toHaveBeenCalledWith(mockNetworkError);
    },
  );

  it('still reports each error when the response errors are an array', async () => {
    mockNetworkError = makeServerError({
      errors: [{ message: 'HCM failed', extensions: { code: 'X' } }],
    });

    await expect(
      makeSsrClient('token').query({
        query: HcmDocument,
        variables: { personNumber: null },
      }),
    ).rejects.toThrow();

    expect(rollbar.error).toHaveBeenCalledWith('HCM failed', { code: 'X' });
  });
});
