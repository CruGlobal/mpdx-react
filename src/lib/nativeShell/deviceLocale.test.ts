import { apiDeviceLocales, toDeviceLocale } from './deviceLocale';

describe('deviceLocale', () => {
  describe('apiDeviceLocales', () => {
    it('is frozen', () => {
      expect(Object.isFrozen(apiDeviceLocales)).toBe(true);
    });

    it('contains no bare fr (the API does not accept it)', () => {
      expect(apiDeviceLocales).not.toContain('fr');
    });
  });

  describe('toDeviceLocale', () => {
    it.each([
      // exact matches pass through unchanged
      ['de', 'de'],
      ['en', 'en'],
      ['ko', 'ko'],
      // regional locales pass through when the API accepts them
      ['pt-BR', 'pt-BR'],
      ['fr-CA', 'fr-CA'],
      ['zh-Hans-CN', 'zh-Hans-CN'],
      ['es-419', 'es-419'],
      // frontend-only bare language upgrades to the regional variant
      ['fr', 'fr-FR'],
      // unknown regional variant falls back to the base language when accepted
      ['en-GB', 'en'],
      ['de-AT', 'de'],
      // unknown regional variant of a regional-only language picks a variant
      ['fr-BE', 'fr-FR'],
      // case-insensitive matching returns the canonical API spelling
      ['PT-br', 'pt-BR'],
      ['FR', 'fr-FR'],
      // unknown locales fall back to en
      ['xx', 'en'],
      ['tlh-KL', 'en'],
    ])('maps %s to %s', (input, expected) => {
      expect(toDeviceLocale(input)).toBe(expected);
    });

    it.each([[''], [null], [undefined]])(
      'falls back to en for %p',
      (input) => {
        expect(toDeviceLocale(input)).toBe('en');
      },
    );
  });
});
