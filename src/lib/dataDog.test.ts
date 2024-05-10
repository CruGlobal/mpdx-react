import {
  clearDataDogUser,
  isDataDogConfigured,
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
    };
  });

  describe('when DataDog is not configured', () => {
    it('isDataDogConfigured should return false', () => {
      expect(isDataDogConfigured()).toEqual(false);
    });

    it('setDataDogUser should not call DD_RUM methods', () => {
      setDataDogUser(setDataDogUserMock);
      expect(window.DD_RUM.clearUser).not.toHaveBeenCalled();
      expect(window.DD_RUM.setUser).not.toHaveBeenCalled();
    });
  });

  describe('when DataDog is configured', () => {
    beforeEach(() => {
      process.env.DATADOG_CONFIGURED = 'true';
    });

    //#region Default Tests
    it('isDataDogConfigured should return false', () => {
      expect(isDataDogConfigured()).toEqual(true);
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
    const getItem = jest.fn();
    const setItem = jest.fn();
    beforeEach(() => {
      Object.defineProperty(window, 'sessionStorage', {
        value: { ...window.sessionStorage, getItem, setItem },
      });
      process.env.DATADOG_CONFIGURED = 'true';
    });

    it('adds new account list ids to the list', () => {
      getItem.mockReturnValue('previous');

      setDataDogUser(setDataDogUserMock);
      expect(window.DD_RUM.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          accountListIds: ['previous', setDataDogUserMock.accountListId],
        }),
      );
      expect(setItem).toHaveBeenCalledWith(
        'accountListIds',
        `previous,${setDataDogUserMock.accountListId}`,
      );
    });

    it('does not add blank account list ids to the list', () => {
      getItem.mockReturnValue(null);

      setDataDogUser({ ...setDataDogUserMock, accountListId: '' });
      expect(window.DD_RUM.setUser).toHaveBeenCalledWith(
        expect.objectContaining({ accountListIds: [] }),
      );
      expect(setItem).not.toHaveBeenCalled();
    });

    it('does not add duplicate account list ids to the list', () => {
      getItem.mockReturnValue(setDataDogUserMock.accountListId);

      setDataDogUser(setDataDogUserMock);
      expect(window.DD_RUM.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          accountListIds: [setDataDogUserMock.accountListId],
        }),
      );
      expect(setItem).not.toHaveBeenCalled();
    });
  });
});
