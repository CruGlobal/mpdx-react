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
};

describe('dataDog', () => {
  beforeEach(() => {
    window.DD_RUM = {
      getUser: jest.fn(),
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
      expect(window.DD_RUM.getUser).not.toHaveBeenCalled();
      expect(window.DD_RUM.clearUser).not.toHaveBeenCalled();
      expect(window.DD_RUM.setUser).not.toHaveBeenCalled();
    });
  });

  describe('when DataDog is configured', () => {
    beforeEach(() => {
      process.env.DATADOG_CONFIGURED = 'true';
    });

    //#region Default Tests
    it('isDataDogConfigured should return true', () => {
      expect(isDataDogConfigured()).toEqual(true);
    });

    it('clearDataDogUser should clear the user', () => {
      clearDataDogUser();
      expect(window.DD_RUM.clearUser).toHaveBeenCalled();
    });

    it('setDataDogUser should clear the previous user and set the new user', () => {
      setDataDogUser(setDataDogUserMock);
      expect(window.DD_RUM.getUser).toHaveBeenCalledTimes(2);
      expect(window.DD_RUM.clearUser).toHaveBeenCalled();
      expect(window.DD_RUM.setUser).toHaveBeenCalled();
    });
  });
});
