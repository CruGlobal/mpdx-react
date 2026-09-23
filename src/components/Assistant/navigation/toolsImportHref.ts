import { IMPORT_SOURCES } from './intents';
import { hasOnlyKeys, isOneOf } from './params';
import { NavigationBuilder } from './types';

export const buildToolsImportHref: NavigationBuilder = (
  params,
  { basePath },
) => {
  if (
    !hasOnlyKeys(params, ['source']) ||
    !isOneOf(params.source, IMPORT_SOURCES)
  ) {
    return null;
  }
  return `${basePath}/tools/import/${params.source}`;
};
