import {
  BeaconFn,
  identifyUser,
  initBeacon,
  suggestArticles,
  showArticle,
} from './helpScout';

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

  describe('suggestArticles', () => {
    it('calls beacon with no envVar defined', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      suggestArticles('');
      expect(beacon).toHaveBeenCalledWith('suggest', []);
    });

    it('calls beacon wiht one envVar defined', () => {
      suggestArticles('HS_CONTACTS_CONTACT_SUGGESTIONS');
      expect(beacon).toHaveBeenCalledWith('suggest', ['ContactArticleId']);
    });
  });

  describe('showArticle', () => {
    it('articleId not defined', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      showArticle();
      expect(beacon).toHaveBeenCalledWith('open', undefined);
    });

    it('articleId is defined but is not env variable', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      showArticle('TestArticleId');
      expect(beacon).toHaveBeenCalledWith('open', undefined);
    });

    it('should call beacon with article', () => {
      process.env.HS_SETUP_FIND_ORGANIZATION;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      showArticle('HS_CONTACTS_CONTACT_SUGGESTIONS');
      expect(beacon).toHaveBeenCalledWith('article', 'ContactArticleId');
    });
  });
});
