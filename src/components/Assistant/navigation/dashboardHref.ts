import { hasOnlyKeys } from './params';
import { NavigationBuilder } from './types';

export const buildDashboardHref: NavigationBuilder = (params, { basePath }) =>
  hasOnlyKeys(params, []) ? basePath : null;
