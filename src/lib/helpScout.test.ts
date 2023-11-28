import {
  BeaconFn,
  identifyUser,
  initBeacon,
  showArticle,
  suggestArticles,
} from './helpScout';

const env = process.env;

describe('HelpScout', () => {
  const beacon = jest.fn() as BeaconFn;
  beforeEach(() => {
    beacon.readyQueue = [];
    window.Beacon = beacon;
  });

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
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
    it('calls callBeacon when the suggestions exist', () => {
      process.env.HS_HOME_SUGGESTIONS = 'article-1,article-2,article-3';
      suggestArticles('HS_HOME_SUGGESTIONS');
      expect(beacon).toHaveBeenCalledWith('suggest', [
        'article-1',
        'article-2',
        'article-3',
      ]);
    });

    it('calls callBeacon when the suggestions do not exist', () => {
      process.env.HS_HOME_SUGGESTIONS = undefined;
      suggestArticles('HS_HOME_SUGGESTIONS');
      expect(beacon).toHaveBeenCalledWith('suggest', []);
    });
  });

  describe('showArticle', () => {
    it('calls callBeacon when the article exists', () => {
      process.env.HS_COACHING_ACTIVITY = 'article-id';
      showArticle('HS_COACHING_ACTIVITY');
      expect(beacon).toHaveBeenCalledWith('article', 'article-id');
    });

    it('calls callBeacon when the article does not exist', () => {
      process.env.HS_COACHING_ACTIVITY = undefined;
      showArticle('HS_COACHING_ACTIVITY');
      expect(beacon).toHaveBeenCalledWith('open', undefined);
    });
  });
});
