import {
  clearDataDogUser,
  isDataDogConfigured,
  setDataDogUser,
} from '../useDataDog';

const setDataDogUserMock = {
  userId: '123456',
  accountListId: '1234-4567-8910-1112-1314',
  name: 'Roger',
  email: 'roger@cru.org',
};

describe('useDataDog', () => {
  beforeEach(() => {
    window.DD_RUM = {
      getUser: jest.fn(),
      setUser: jest.fn(),
      clearUser: jest.fn(),
    };
  });

  describe('DataDog not configured', () => {
    it('should return isDataDogConfigured as false', () => {
      expect(isDataDogConfigured()).toEqual(false);
    });

    it('should NOT run setDataDogUser', () => {
      setDataDogUser(setDataDogUserMock);
      expect(window.DD_RUM.getUser).not.toHaveBeenCalled();
      expect(window.DD_RUM.clearUser).not.toHaveBeenCalled();
      expect(window.DD_RUM.setUser).not.toHaveBeenCalled();
    });
  });

  describe('DataDog configured', () => {
    beforeEach(() => {
      process.env.DATADOG_CONFIGURED = 'true';
    });

    //#region Default Tests
    it('should return isDataDogConfigured as true', () => {
      expect(isDataDogConfigured()).toEqual(true);
    });

    it('should run clearDataDogUser', () => {
      clearDataDogUser();
      expect(window.DD_RUM.clearUser).toHaveBeenCalled();
    });

    it('New User', () => {
      setDataDogUser(setDataDogUserMock);
      expect(window.DD_RUM.getUser).toHaveBeenCalledTimes(2);
      expect(window.DD_RUM.clearUser).toHaveBeenCalled();
      expect(window.DD_RUM.setUser).toHaveBeenCalled();
    });
  });
});
