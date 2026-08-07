import {
  accountListIdsStorageKey,
  addDataDogError,
  clearDataDogUser,
  isDatadogConfigured,
  reportGraphQLError,
  reportNetworkError,
  setDataDogUser,
} from './dataDog';

const setDataDogUserMock = {
  userId: '123456',
  accountListId: '1234-4567-8910-1112-1314',
  name: 'Roger',
  email: 'roger@cru.org',
  language: 'en-us',
};

describe('dataDog', () => {
  beforeEach(() => {
    window.DD_RUM = {
      setUser: jest.fn(),
      clearUser: jest.fn(),
      addError: jest.fn(),
    };
  });

  describe('when Datadog is not configured', () => {
    it('isDatadogConfigured should return false', () => {
      expect(isDatadogConfigured()).toEqual(false);
    });

    it('setDataDogUser should not call DD_RUM methods', () => {
      setDataDogUser(setDataDogUserMock);
      expect(window.DD_RUM.clearUser).not.toHaveBeenCalled();
      expect(window.DD_RUM.setUser).not.toHaveBeenCalled();
    });
  });

  describe('when Datadog is configured', () => {
    beforeEach(() => {
      process.env.DATADOG_CONFIGURED = 'true';
    });

    //#region Default Tests
    it('isDatadogConfigured should return true', () => {
      expect(isDatadogConfigured()).toEqual(true);
    });

    it('clearDataDogUser should clear the user', () => {
      clearDataDogUser();
      expect(window.DD_RUM.clearUser).toHaveBeenCalled();
    });

    it('setDataDogUser should set the new user', () => {
      setDataDogUser(setDataDogUserMock);
      expect(window.DD_RUM.setUser).toHaveBeenCalled();
    });
  });

  describe('setDataDogUser', () => {
    beforeEach(() => {
      process.env.DATADOG_CONFIGURED = 'true';
    });

    it('adds new account list ids to the list', () => {
      window.localStorage.setItem(accountListIdsStorageKey, 'previous');

      setDataDogUser(setDataDogUserMock);
      expect(window.DD_RUM.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          accountListIds: ['previous', setDataDogUserMock.accountListId],
        }),
      );
      expect(window.localStorage.getItem(accountListIdsStorageKey)).toBe(
        `previous,${setDataDogUserMock.accountListId}`,
      );
    });

    it('does not add null account list ids to the list', () => {
      window.localStorage.removeItem(accountListIdsStorageKey);

      setDataDogUser({ ...setDataDogUserMock, accountListId: null });
      expect(window.DD_RUM.setUser).toHaveBeenCalledWith(
        expect.objectContaining({ accountListIds: [] }),
      );
      expect(window.localStorage.getItem(accountListIdsStorageKey)).toBeNull();
    });

    it('does not add duplicate account list ids to the list', () => {
      window.localStorage.setItem(
        accountListIdsStorageKey,
        setDataDogUserMock.accountListId,
      );

      setDataDogUser(setDataDogUserMock);
      expect(window.DD_RUM.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          accountListIds: [setDataDogUserMock.accountListId],
        }),
      );
      expect(window.localStorage.getItem(accountListIdsStorageKey)).toBe(
        setDataDogUserMock.accountListId,
      );
    });

    it('resets the account list ids list after calling clearDataDogUser', () => {
      window.localStorage.setItem(accountListIdsStorageKey, 'previous');
      clearDataDogUser();

      setDataDogUser(setDataDogUserMock);
      expect(window.DD_RUM.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          accountListIds: [setDataDogUserMock.accountListId],
        }),
      );
      expect(window.localStorage.getItem(accountListIdsStorageKey)).toBe(
        setDataDogUserMock.accountListId,
      );
    });
  });
});

describe('addDataDogError', () => {
  beforeEach(() => {
    process.env.DATADOG_CONFIGURED = 'true';
    window.DD_RUM = {
      setUser: jest.fn(),
      clearUser: jest.fn(),
      addError: jest.fn(),
    };
  });

  it('forwards the error and context to DD_RUM.addError', () => {
    const error = new Error('Boom');
    addDataDogError(error, { mpdxErrorType: 'graphql' });

    expect(window.DD_RUM.addError).toHaveBeenCalledWith(error, {
      mpdxErrorType: 'graphql',
    });
  });

  it('does nothing when Datadog is not configured', () => {
    process.env.DATADOG_CONFIGURED = 'false';

    addDataDogError(new Error('Boom'));

    expect(window.DD_RUM.addError).not.toHaveBeenCalled();
  });
});

describe('GraphQL error reporting', () => {
  const operation = { operationName: 'ContactDetails' };

  beforeEach(() => {
    process.env.DATADOG_CONFIGURED = 'true';
    window.DD_RUM = {
      setUser: jest.fn(),
      clearUser: jest.fn(),
      addError: jest.fn(),
    };
  });

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
        { statusCode: 502, result: { detail: 'roger@cru.org already exists' } },
      );

      reportNetworkError(serverError, operation);

      expect(window.DD_RUM.addError).toHaveBeenCalledWith(serverError, {
        mpdxErrorType: 'graphql_network',
        operationName: 'ContactDetails',
        statusCode: 502,
      });
    });
  });
});
