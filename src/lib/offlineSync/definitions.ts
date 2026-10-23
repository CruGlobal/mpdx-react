import { contactsSync } from './contacts/contactsSync';
import { OfflineSyncDefinition } from './offlineSync';

export const offlineSyncDefinitions: OfflineSyncDefinition[] = [contactsSync];
