import { ApolloLink, Observable } from '@apollo/client';
import { HcmDocument } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import snackNotifications from 'src/components/Snackbar/Snackbar';
import { reportNetworkError } from 'src/lib/dataDog';
import makeClient from './client';

jest.mock('next-auth/react');
jest.mock('src/components/Snackbar/Snackbar');
jest.mock('src/lib/dataDog');

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

describe('makeClient error link', () => {
  it.each([
    ['an object', { errors: { title: 'Internal Server Error' } }],
    ['a string', { errors: 'Internal Server Error' }],
  ])(
    'passes the network error on when the response errors are %s',
    async (_, result) => {
      mockNetworkError = makeServerError(result);

      await expect(
        makeClient('token').query({
          query: HcmDocument,
          variables: { personNumber: null },
        }),
      ).rejects.toThrow('Response not successful: Received status code 500');

      expect(snackNotifications.error).toHaveBeenCalledWith(
        'Response not successful: Received status code 500',
      );
      expect(reportNetworkError).toHaveBeenCalledWith(
        mockNetworkError,
        expect.objectContaining({ operationName: 'Hcm' }),
      );
    },
  );

  it('still shows each error when the response errors are an array', async () => {
    mockNetworkError = makeServerError({ errors: [{ message: 'HCM failed' }] });

    await expect(
      makeClient('token').query({
        query: HcmDocument,
        variables: { personNumber: null },
      }),
    ).rejects.toThrow();

    expect(snackNotifications.error).toHaveBeenCalledWith('HCM failed');
  });
});
