import { ApolloLink, Observable, gql } from '@apollo/client';
import snackNotifications from 'src/components/Snackbar/Snackbar';
import { reportNetworkError } from 'src/lib/dataDog';
import makeClient from './client';

jest.mock('src/components/Snackbar/Snackbar', () => ({
  __esModule: true,
  default: { error: jest.fn() },
}));
jest.mock('src/lib/dataDog');
jest.mock('./link', () => ({
  ...jest.requireActual('./link'),
  batchLink: new ApolloLink(
    () =>
      new Observable((observer) => {
        observer.error(new Error('Failed to fetch'));
      }),
  ),
}));

const PingMutation = gql`
  mutation Ping {
    ping
  }
`;

describe('makeClient', () => {
  describe('network errors', () => {
    it('shows and reports them', async () => {
      await expect(
        makeClient('token').mutate({ mutation: PingMutation }),
      ).rejects.toThrow('Failed to fetch');

      expect(snackNotifications.error).toHaveBeenCalledWith('Failed to fetch');
      expect(reportNetworkError).toHaveBeenCalled();
    });

    it('stays quiet when the operation suppresses errors', async () => {
      await expect(
        makeClient('token').mutate({
          mutation: PingMutation,
          context: { suppressErrors: true },
        }),
      ).rejects.toThrow('Failed to fetch');

      expect(snackNotifications.error).not.toHaveBeenCalled();
      expect(reportNetworkError).not.toHaveBeenCalled();
    });
  });
});
