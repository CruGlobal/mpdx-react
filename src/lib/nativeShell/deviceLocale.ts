/**
 * Locales accepted by the MPDX API for `User::Device#locale`
 * (`POST /api/v2/user/devices` presence-validates `locale` against
 * `I18n.available_locales`).
 *
 * This list MUST mirror `I18n.config.available_locales` in
 * mpdx_api/config/initializers/fast_gettext.rb — drift causes 422s on device
 * registration. Note: the frontend has a bare `fr` locale that the API does
 * not accept; `toDeviceLocale` maps it to `fr-FR`.
 */
export const apiDeviceLocales: readonly string[] = Object.freeze([
  'en',
  'en-US',
  'ar',
  'hy',
  'my',
  'zh-Hans-CN',
  'nl-NL',
  'fr-CA',
  'fr-FR',
  'de',
  'de-CH',
  'id',
  'it',
  'ko',
  'pl',
  'pt-BR',
  'ro',
  'ru',
  'es-419',
  'th',
  'tr',
  'uk',
  'vi',
]);

const fallbackLocale = 'en';

/**
 * Maps a frontend locale (from `useLocale()`) to a locale the API accepts.
 *
 * Resolution order: exact match → bare base language (`en-GB` → `en`) →
 * language-echoing regional variant (`fr` → `fr-FR`) → first variant of the
 * same base language (`es` → `es-419`) → `'en'`.
 */
export const toDeviceLocale = (locale: string | null | undefined): string => {
  if (!locale) {
    return fallbackLocale;
  }
  const normalized = locale.toLowerCase();
  const exact = apiDeviceLocales.find(
    (accepted) => accepted.toLowerCase() === normalized,
  );
  if (exact) {
    return exact;
  }

  const base = normalized.split('-')[0];
  const baseExact = apiDeviceLocales.find(
    (accepted) => accepted.toLowerCase() === base,
  );
  if (baseExact) {
    return baseExact;
  }

  const languageEcho = apiDeviceLocales.find(
    (accepted) => accepted.toLowerCase() === `${base}-${base}`,
  );
  if (languageEcho) {
    return languageEcho;
  }

  const baseVariant = apiDeviceLocales.find(
    (accepted) => accepted.toLowerCase().split('-')[0] === base,
  );
  return baseVariant ?? fallbackLocale;
};
