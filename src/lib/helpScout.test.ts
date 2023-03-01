import { BeaconFn, identifyUser, initBeacon } from './helpScout';

describe('HelpScout', () => {
  const beacon = jest.fn() as BeaconFn;
  beforeEach(() => {
    beacon.readyQueue = [];
    window.Beacon = beacon;
  });

  describe('initBeacon', () => {
    it('sets window.Beacon if HelpScout has not loaded yet', () => {
      window.Beacon = undefined;

      initBeacon();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(window.Beacon.readyQueue).toHaveLength(1);
    });

    it('does nothing if HelpScout has already loaded', () => {
      initBeacon();

      expect(beacon).toHaveBeenCalledTimes(1);
    });
  });

  describe('identifyUser', () => {
    it('calls callBeacon', () => {
      identifyUser('id', 'email', 'name');
      expect(beacon).toHaveBeenCalledWith('identify', {
        id: 'id',
        name: 'name',
        email: 'email',
      });
    });
  });
});
