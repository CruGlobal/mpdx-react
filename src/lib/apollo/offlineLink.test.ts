import { ApolloLink, Observable, execute, gql } from '@apollo/client';
import snackNotifications from '../../components/Snackbar/Snackbar';
import { offlineLink } from './offlineLink';

jest.mock('../../components/Snackbar/Snackbar', () => ({
  __esModule: true,
  default: { warning: jest.fn() },
}));

const query = gql`
  query TestContacts {
    contacts {
      id
    }
  }
`;

const mutation = gql`
  mutation TestUpdateContact {
    updateContact {
      id
    }
  }
`;

const makeTerminatingLink = (spy: jest.Mock) =>
  new ApolloLink((operation) => {
    spy(operation.operationName);
    return Observable.of({ data: {} });
  });

const setOnline = (onLine: boolean) =>
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: onLine,
  });

describe('offlineLink', () => {
  afterEach(() => {
    setOnline(true);
    jest.clearAllMocks();
  });

  it('forwards mutations when online', () => {
    const spy = jest.fn();
    const link = offlineLink.concat(makeTerminatingLink(spy));

    return new Promise<void>((resolve) => {
      execute(link, { query: mutation }).subscribe({
        complete: () => {
          expect(spy).toHaveBeenCalledWith('TestUpdateContact');
          resolve();
        },
      });
    });
  });

  it('blocks mutations when offline with an error', () => {
    setOnline(false);
    const spy = jest.fn();
    const link = offlineLink.concat(makeTerminatingLink(spy));

    return new Promise<void>((resolve) => {
      execute(link, { query: mutation }).subscribe({
        error: (err) => {
          expect(spy).not.toHaveBeenCalled();
          expect(err.message).toContain('offline');
          expect(snackNotifications.warning).toHaveBeenCalledWith(
            expect.stringContaining('offline'),
            expect.objectContaining({ key: 'offline-blocked-save' }),
          );
          resolve();
        },
      });
    });
  });

  it('forwards queries even when offline', () => {
    setOnline(false);
    const spy = jest.fn();
    const link = offlineLink.concat(makeTerminatingLink(spy));

    return new Promise<void>((resolve) => {
      execute(link, { query }).subscribe({
        complete: () => {
          expect(spy).toHaveBeenCalledWith('TestContacts');
          resolve();
        },
      });
    });
  });
});
