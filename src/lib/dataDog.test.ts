import {
  accountListIdsStorageKey,
  addDatadogError,
  clearDatadogUser,
  reportGraphQLError,
  reportNetworkError,
  setDatadogUser,
} from './dataDog';

const setDatadogUserMock = {
  userId: '123456',
  accountListId: '1234-4567-8910-1112-1314',
  name: 'Roger',
  email: 'roger@cru.org',
  language: 'en-us',
};

describe('Datadog', () => {
  beforeEach(() => {
    window.DD_RUM = {
      setUser: jest.fn(),
      clearUser: jest.fn(),
      addError: jest.fn(),
      onReady: jest.fn((callback: () => void) => callback()),
    };
    process.env.DATADOG_CONFIGURED = 'true';
  });

  describe('when Datadog is not configured', () => {
    beforeEach(() => {
      process.env.DATADOG_CONFIGURED = 'false';
    });

    it('setDatadogUser should not call DD_RUM methods', () => {
      setDatadogUser(setDatadogUserMock);
      expect(window.DD_RUM.clearUser).not.toHaveBeenCalled();
      expect(window.DD_RUM.setUser).not.toHaveBeenCalled();
    });

    it('clearDatadogUser should still clear the stored account list ids', () => {
      window.localStorage.setItem(accountListIdsStorageKey, 'previous');

      clearDatadogUser();

      expect(window.localStorage.getItem(accountListIdsStorageKey)).toBeNull();
      expect(window.DD_RUM.clearUser).not.toHaveBeenCalled();
    });
  });

  describe('when Datadog is configured', () => {
    //#region Default Tests
    it('clearDatadogUser should clear the user', () => {
      clearDatadogUser();
      expect(window.DD_RUM.clearUser).toHaveBeenCalled();
    });

    it('setDatadogUser should set the new user', () => {
      setDatadogUser(setDatadogUserMock);
      expect(window.DD_RUM.setUser).toHaveBeenCalled();
    });
  });

  describe('setDatadogUser', () => {
    it('adds new account list ids to the list', () => {
      window.localStorage.setItem(accountListIdsStorageKey, 'previous');

      setDatadogUser(setDatadogUserMock);
      expect(window.DD_RUM.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          accountListIds: ['previous', setDatadogUserMock.accountListId],
        }),
      );
      expect(window.localStorage.getItem(accountListIdsStorageKey)).toBe(
        `previous,${setDatadogUserMock.accountListId}`,
      );
    });

    it('does not add null account list ids to the list', () => {
      window.localStorage.removeItem(accountListIdsStorageKey);

      setDatadogUser({ ...setDatadogUserMock, accountListId: null });
      expect(window.DD_RUM.setUser).toHaveBeenCalledWith(
        expect.objectContaining({ accountListIds: [] }),
      );
      expect(window.localStorage.getItem(accountListIdsStorageKey)).toBeNull();
    });

    it('does not add duplicate account list ids to the list', () => {
      window.localStorage.setItem(
        accountListIdsStorageKey,
        setDatadogUserMock.accountListId,
      );

      setDatadogUser(setDatadogUserMock);
      expect(window.DD_RUM.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          accountListIds: [setDatadogUserMock.accountListId],
        }),
      );
      expect(window.localStorage.getItem(accountListIdsStorageKey)).toBe(
        setDatadogUserMock.accountListId,
      );
    });

    it('resets the account list ids list after calling clearDatadogUser', () => {
      window.localStorage.setItem(accountListIdsStorageKey, 'previous');
      clearDatadogUser();

      setDatadogUser(setDatadogUserMock);
      expect(window.DD_RUM.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          accountListIds: [setDatadogUserMock.accountListId],
        }),
      );
      expect(window.localStorage.getItem(accountListIdsStorageKey)).toBe(
        setDatadogUserMock.accountListId,
      );
    });
  });

  describe('addDatadogError', () => {
    it('forwards the error and context to DD_RUM.addError', () => {
      const error = new Error('Boom');
      addDatadogError(error, { mpdxErrorType: 'graphql' });

      expect(window.DD_RUM.addError).toHaveBeenCalledWith(error, {
        mpdxErrorType: 'graphql',
      });
    });

    it('does nothing when Datadog is not configured', () => {
      process.env.DATADOG_CONFIGURED = 'false';

      addDatadogError(new Error('Boom'));

      expect(window.DD_RUM.addError).not.toHaveBeenCalled();
    });
  });

  describe('GraphQL error reporting', () => {
    const operation = { operationName: 'ContactDetails' };

    describe('reportGraphQLError', () => {
      it('reports a labeled error with operation context', () => {
        reportGraphQLError(
          {
            message:
              'Contact with id=00000000-0000-0000-0000-000000000000 not found',
            path: ['contact'],
            extensions: { code: 'NOT_FOUND' },
          },
          operation,
        );

        expect(window.DD_RUM.addError).toHaveBeenCalledWith(
          expect.objectContaining({
            message:
              'GraphQL error in ContactDetails: Contact with id=00000000-0000-0000-0000-000000000000 not found',
          }),
          {
            mpdxErrorType: 'graphql',
            operationName: 'ContactDetails',
            errorCode: 'NOT_FOUND',
            errorPath: 'contact',
          },
        );
      });
    });

    describe('reportNetworkError', () => {
      it('reports the network error with operation context', () => {
        const networkError = new Error('Failed to fetch');

        reportNetworkError(networkError, operation);

        expect(window.DD_RUM.addError).toHaveBeenCalledWith(networkError, {
          mpdxErrorType: 'graphql_network',
          operationName: 'ContactDetails',
          statusCode: undefined,
        });
      });

      it('reports the status code when the server responded', () => {
        const serverError = Object.assign(
          new Error('Response not successful: Received status code 502'),
          {
            statusCode: 502,
            result: { detail: 'roger@cru.org already exists' },
          },
        );

        reportNetworkError(serverError, operation);

        expect(window.DD_RUM.addError).toHaveBeenCalledWith(serverError, {
          mpdxErrorType: 'graphql_network',
          operationName: 'ContactDetails',
          statusCode: 502,
        });
      });
    });

    describe('marking errors as reported', () => {
      it('marks GraphQL errors', () => {
        const graphQLError = { message: 'Boom' };

        reportGraphQLError(graphQLError, operation);
        expect(window.__reportedErrors?.has(graphQLError)).toBe(true);
      });

      it('marks network errors', () => {
        const networkError = new Error('Failed to fetch');

        reportNetworkError(networkError, operation);
        expect(window.__reportedErrors?.has(networkError)).toBe(true);
      });
    });
  });
});
