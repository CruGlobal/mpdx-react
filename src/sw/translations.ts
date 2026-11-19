import type { RouteMatchCallbackOptions } from 'serwist';

const translationFile = /^\/locales\/[^/]+\/translation\.json$/;

// The files i18next loads from /locales/{{lng}}/translation.json (src/lib/i18n.ts)
export const isTranslationFile = ({
  url,
  sameOrigin,
}: Pick<RouteMatchCallbackOptions, 'url' | 'sameOrigin'>): boolean =>
  sameOrigin && translationFile.test(url.pathname);
