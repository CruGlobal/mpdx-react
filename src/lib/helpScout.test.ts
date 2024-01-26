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
    jest.resetModules();
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
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
      const makeSuggestions = (key: string) => `${key}-1,${key}-2`;
      Object.assign(process.env, {
        HS_COACHING_SUGGESTIONS: makeSuggestions('coaching'),
        HS_CONTACTS_CONTACT_SUGGESTIONS: makeSuggestions('contacts-contact'),
        HS_CONTACTS_SUGGESTIONS: makeSuggestions('contacts'),
        HS_HOME_SUGGESTIONS: makeSuggestions('home'),
        HS_REPORTS_SUGGESTIONS: makeSuggestions('reports'),
        HS_TASKS_SUGGESTIONS: makeSuggestions('tasks'),
        HS_SETTINGS_SERVICES_SUGGESTIONS: makeSuggestions('services'),
        HS_SETTINGS_PREFERENCES_SUGGESTIONS: makeSuggestions('preferences'),
      });

      suggestArticles('HS_COACHING_SUGGESTIONS');
      expect(beacon).toHaveBeenLastCalledWith('suggest', [
        'coaching-1',
        'coaching-2',
      ]);

      suggestArticles('HS_CONTACTS_CONTACT_SUGGESTIONS');
      expect(beacon).toHaveBeenLastCalledWith('suggest', [
        'contacts-contact-1',
        'contacts-contact-2',
      ]);

      suggestArticles('HS_CONTACTS_SUGGESTIONS');
      expect(beacon).toHaveBeenLastCalledWith('suggest', [
        'contacts-1',
        'contacts-2',
      ]);

      suggestArticles('HS_HOME_SUGGESTIONS');
      expect(beacon).toHaveBeenLastCalledWith('suggest', ['home-1', 'home-2']);

      suggestArticles('HS_REPORTS_SUGGESTIONS');
      expect(beacon).toHaveBeenLastCalledWith('suggest', [
        'reports-1',
        'reports-2',
      ]);

      suggestArticles('HS_TASKS_SUGGESTIONS');
      expect(beacon).toHaveBeenLastCalledWith('suggest', [
        'tasks-1',
        'tasks-2',
      ]);

      suggestArticles('HS_SETTINGS_SERVICES_SUGGESTIONS');
      expect(beacon).toHaveBeenLastCalledWith('suggest', [
        'services-1',
        'services-2',
      ]);

      suggestArticles('HS_SETTINGS_PREFERENCES_SUGGESTIONS');
      expect(beacon).toHaveBeenLastCalledWith('suggest', [
        'preferences-1',
        'preferences-2',
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
      Object.assign(process.env, {
        HS_COACHING_ACTIVITY: 'coaching-activity',
        HS_COACHING_ACTIVITY_SUMMARY: 'coaching-activity-summary',
        HS_COACHING_APPOINTMENTS_AND_RESULTS:
          'coaching-appointments-and-results',
        HS_COACHING_COMMITMENTS: 'coaching-commitments',
        HS_COACHING_OUTSTANDING_RECURRING_COMMITMENTS:
          'coaching-outstanding-recurring-commitments',
        HS_COACHING_OUTSTANDING_SPECIAL_NEEDS:
          'coaching-outstanding-special-needs',
        HS_SETUP_FIND_ORGANIZATION: 'organization-activity',
      });

      showArticle('HS_SETUP_FIND_ORGANIZATION');
      expect(beacon).toHaveBeenCalledWith('article', 'organization-activity');

      showArticle('HS_COACHING_ACTIVITY');
      expect(beacon).toHaveBeenCalledWith('article', 'coaching-activity');

      showArticle('HS_COACHING_ACTIVITY_SUMMARY');
      expect(beacon).toHaveBeenCalledWith(
        'article',
        'coaching-activity-summary',
      );

      showArticle('HS_COACHING_APPOINTMENTS_AND_RESULTS');
      expect(beacon).toHaveBeenCalledWith(
        'article',
        'coaching-appointments-and-results',
      );

      showArticle('HS_COACHING_COMMITMENTS');
      expect(beacon).toHaveBeenCalledWith('article', 'coaching-commitments');

      showArticle('HS_COACHING_OUTSTANDING_RECURRING_COMMITMENTS');
      expect(beacon).toHaveBeenCalledWith(
        'article',
        'coaching-outstanding-recurring-commitments',
      );

      showArticle('HS_COACHING_OUTSTANDING_SPECIAL_NEEDS');
      expect(beacon).toHaveBeenCalledWith(
        'article',
        'coaching-outstanding-special-needs',
      );
    });

    it('calls callBeacon when the article does not exist', () => {
      process.env.HS_COACHING_ACTIVITY = undefined;
      showArticle('HS_COACHING_ACTIVITY');
      expect(beacon).toHaveBeenCalledWith('open', undefined);
    });
  });
});
