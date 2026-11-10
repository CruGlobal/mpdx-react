import { DateTime } from 'luxon';
import { TFunction } from 'react-i18next';
import {
  formatAddress,
  formatChangeMadeBy,
} from 'src/components/Shared/AddressHistoryModal/addressHistoryHelpers';
import { downloadCsv } from 'src/components/Shared/AddressHistoryModal/downloadAddressHistory';
import { StatusEnum } from 'src/graphql/types.generated';
import { dateFormat } from 'src/lib/intlFormat';
import { AddressChangeRow } from '../helpers';

interface AddressChangesCsvOptions {
  addressChanges: AddressChangeRow[];
  currentUserId: string | undefined;
  getStatusLabel: (status: StatusEnum) => string;
  t: TFunction;
  locale: string;
}

export const createAddressChangesCsv = ({
  addressChanges,
  currentUserId,
  getStatusLabel,
  t,
  locale,
}: AddressChangesCsvOptions): string[][] => [
  [
    t('Date'),
    t('Partner'),
    t('Donor Account Numbers'),
    t('Status'),
    t('Address'),
    t('Previous Address'),
    t('Made by'),
  ],
  ...addressChanges.map((addressChange) => [
    dateFormat(DateTime.fromISO(addressChange.date), locale),
    addressChange.partnerName,
    addressChange.donorAccountNumbers ?? '',
    addressChange.partnerStatus
      ? getStatusLabel(addressChange.partnerStatus)
      : '',
    formatAddress(addressChange),
    addressChange.previousAddress
      ? formatAddress(addressChange.previousAddress)
      : '',
    formatChangeMadeBy(addressChange, currentUserId, t),
  ]),
];

export const downloadAddressChanges = (
  options: AddressChangesCsvOptions,
): void =>
  downloadCsv(
    createAddressChangesCsv(options),
    options.t('Address Change History'),
  );
