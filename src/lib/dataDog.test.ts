import {
  accountListIdsStorageKey,
  clearDatadogUser,
  isDatadogConfigured,
  setDatadogUser,
} from './dataDog';

const setDatadogUserMock = {
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
    };
  });

  describe('when Datadog is not configured', () => {
    it('isDatadogConfigured should return false', () => {
      expect(isDatadogConfigured()).toEqual(false);
    });

    it('setDatadogUser should not call DD_RUM methods', () => {
      setDatadogUser(setDatadogUserMock);
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
    beforeEach(() => {
      process.env.DATADOG_CONFIGURED = 'true';
    });

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
});
