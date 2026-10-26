import { DateTime } from 'luxon';
import { buildURI } from 'react-csv/lib/core';
import { TFunction } from 'react-i18next';
import { dateFormat } from 'src/lib/intlFormat';
import { AddressHistoryChangeFragment } from './AddressHistory.generated';
import { formatAddress, formatChangeMadeBy } from './addressHistoryHelpers';

export const downloadCsv = (rows: string[][], title: string): void => {
  const link = document.createElement('a');
  link.setAttribute('href', buildURI(rows, true));
  link.setAttribute('download', `${title}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const createAddressHistoryCsv = (
  changes: AddressHistoryChangeFragment[],
  currentUserId: string | undefined,
  t: TFunction,
  locale: string,
): string[][] => [
  [t('Date'), t('Address'), t('Previous Address'), t('Made by')],
  ...changes.map((change) => [
    dateFormat(DateTime.fromISO(change.date), locale),
    formatAddress(change),
    change.previousAddress ? formatAddress(change.previousAddress) : '',
    formatChangeMadeBy(change, currentUserId, t),
  ]),
];

export const downloadAddressHistory = (
  changes: AddressHistoryChangeFragment[],
  contactName: string,
  currentUserId: string | undefined,
  t: TFunction,
  locale: string,
): void =>
  downloadCsv(
    createAddressHistoryCsv(changes, currentUserId, t, locale),
    t('Address History - {{name}}', { name: contactName }),
  );
