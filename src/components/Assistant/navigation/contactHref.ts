import { ALIAS_FORMAT, UUID_FORMAT } from './intents';
import { hasOnlyKeys } from './params';
import { NavigationBuilder } from './types';

export const buildContactHref: NavigationBuilder = (params, { basePath }) => {
  if (!hasOnlyKeys(params, ['alias', 'contact_id'])) {
    return null;
  }
  const { alias, contact_id: contactId } = params;
  if (typeof alias !== 'string' || !ALIAS_FORMAT.test(alias)) {
    return null;
  }
  // Tier 1 cannot resolve an alias, so only a contact id the server adds makes a link
  if (typeof contactId !== 'string' || !UUID_FORMAT.test(contactId)) {
    return null;
  }
  return `${basePath}/contacts/${contactId}`;
};
