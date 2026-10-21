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
  AddressAuthor & { changedAt: DateTime; previous?: AddressParts };

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
  ...addresses.map((address) => [
    dateFormat(address.changedAt, locale),
    formatAddress(address),
    address.previous ? formatAddress(address.previous) : '',
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
