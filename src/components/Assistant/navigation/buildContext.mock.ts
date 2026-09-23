import { DateTime } from 'luxon';
import { BuildContext } from './types';

export const testContext: BuildContext = {
  basePath: '/accountLists/account-list-1',
  now: DateTime.fromISO('2026-03-15T10:00:00'),
};
