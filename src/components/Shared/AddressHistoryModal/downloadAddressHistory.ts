import { DateTime } from 'luxon';
import { buildURI } from 'react-csv/lib/core';
import { TFunction } from 'react-i18next';
import { dateFormat } from 'src/lib/intlFormat';
import {
  AddressAuthor,
  AddressParts,
  formatAddress,
  formatChangeMadeBy,
} from './addressHistoryHelpers';

export type HistoryAddress = AddressParts &
  AddressAuthor & { changedAt: DateTime };

export const downloadCsv = (rows: string[][], title: string): void => {
  const link = document.createElement('a');
  link.setAttribute('href', buildURI(rows, true));
  link.setAttribute('download', `${title}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const createAddressHistoryCsv = (
  addresses: HistoryAddress[],
  currentUserId: string | undefined,
  t: TFunction,
  locale: string,
): string[][] => [
  [t('Date'), t('Address'), t('Previous Address'), t('Made by')],
  // Newest first, so each address replaced the one after it
  ...addresses.map((address, index) => [
    dateFormat(address.changedAt, locale),
    formatAddress(address),
    addresses[index + 1] ? formatAddress(addresses[index + 1]) : '',
    formatChangeMadeBy(address, currentUserId, t),
  ]),
];

export const downloadAddressHistory = (
  addresses: HistoryAddress[],
  contactName: string,
  currentUserId: string | undefined,
  t: TFunction,
  locale: string,
): void =>
  downloadCsv(
    createAddressHistoryCsv(addresses, currentUserId, t, locale),
    t('Address History - {{name}}', { name: contactName }),
  );
