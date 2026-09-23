import { UUID_FORMAT } from './intents';
import { hasOnlyKeys } from './params';
import { NavigationBuilder } from './types';

export const buildAppealHref: NavigationBuilder = (params, { basePath }) => {
  if (!hasOnlyKeys(params, ['id'])) {
    return null;
  }
  const { id } = params;
  if (id === undefined) {
    return `${basePath}/tools/appeals`;
  }
  if (typeof id !== 'string' || !UUID_FORMAT.test(id)) {
    return null;
  }
  return `${basePath}/tools/appeals/appeal/${id}`;
};
