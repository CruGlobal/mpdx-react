import { hasOnlyKeys } from './params';
import { NavigationBuilder } from './types';

export const buildCoachingHref: NavigationBuilder = (params, { basePath }) =>
  hasOnlyKeys(params, []) ? `${basePath}/coaching` : null;
