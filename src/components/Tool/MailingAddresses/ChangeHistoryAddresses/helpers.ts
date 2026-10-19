import { partition } from 'lodash';
import { DateTime } from 'luxon';
import { TFunction } from 'react-i18next';
import {
  Address,
  AddressChangeMadeByEnum,
  ContactFilterPartnerEnum,
} from 'src/graphql/types.generated';
import { manualSourceValue, sourceToStr } from 'src/lib/sourceHelper';
import { AddressChangeHistoryQuery } from './AddressChangeHistory.generated';

export const formatPartnerFilter = (
  partner: ContactFilterPartnerEnum,
  t: TFunction,
): string => {
  const labels: Record<ContactFilterPartnerEnum, string> = {
    [ContactFilterPartnerEnum.GaveOneOrMore]: t('Gave One or More Gifts'),
    [ContactFilterPartnerEnum.GaveLastTwoYears]: t('Gave in the Last 2 Years'),
    [ContactFilterPartnerEnum.Lost]: t('Lost Partners'),
  };
  return labels[partner];
};

export enum ContactFilterChangedDuringEnum {
  Last3Months = 'Last3Months',
  Last6Months = 'Last6Months',
  Last12Months = 'Last12Months',
  Custom = 'Custom',
}

export const formatChangedDuringFilter = (
  changedDuring: ContactFilterChangedDuringEnum,
  t: TFunction,
): string => {
  const labels: Record<ContactFilterChangedDuringEnum, string> = {
    [ContactFilterChangedDuringEnum.Last3Months]: t('Last 3 Months'),
    [ContactFilterChangedDuringEnum.Last6Months]: t('Last 6 Months'),
    [ContactFilterChangedDuringEnum.Last12Months]: t('Last 12 Months'),
    [ContactFilterChangedDuringEnum.Custom]: t('Custom Date Range'),
  };
  return labels[changedDuring];
};

export interface DateRange {
  startDate: DateTime | null;
  endDate: DateTime | null;
}

export type AddressChangeRow =
  AddressChangeHistoryQuery['addressChangeHistory']['nodes'][number];

export type MadeByOption =
  AddressChangeHistoryQuery['addressChangeHistory']['madeByOptions'][number];

export const formatMadeByOption = (
  option: MadeByOption,
  currentUserId: string | undefined,
  t: TFunction,
): string => {
  if (option.type === AddressChangeMadeByEnum.Source) {
    return sourceToStr(t, option.label);
  }
  if (option.type === AddressChangeMadeByEnum.UnknownUser) {
    return t('Unknown user');
  }
  if (option.user && option.user.id === currentUserId) {
    return t('You');
  }
  return option.label;
};

export const formatAddress = ({
  street,
  city,
  state,
  postalCode,
}: Pick<Address, 'street' | 'city' | 'state' | 'postalCode'>): string =>
  [
    street?.replace(/\n/g, ', '),
    city,
    [state, postalCode].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');

export const isAutomaticChange = (source: string): boolean =>
  source !== manualSourceValue;

export const formatChangeMadeBy = (
  { source, createdByUser }: Pick<AddressChangeRow, 'source' | 'createdByUser'>,
  currentUserId: string | undefined,
  t: TFunction,
): string => {
  if (isAutomaticChange(source)) {
    return t('Automatic update from {{source}}', {
      source: sourceToStr(t, source),
    });
  }
  const appName = sourceToStr(t, source);
  if (createdByUser && createdByUser.id === currentUserId) {
    return t('You, in {{appName}}', { appName });
  }
  const name =
    [createdByUser?.firstName, createdByUser?.lastName]
      .filter(Boolean)
      .join(' ') || t('Unknown user');
  return t('{{name}}, in {{appName}}', { name, appName });
};

interface MadeByMenuItem {
  value: string;
  label: string;
}

export const groupMadeByOptions = (
  options: MadeByOption[],
  currentUserId: string | undefined,
  t: TFunction,
): { automatic: MadeByMenuItem[]; mpdx: MadeByMenuItem[] } => {
  const toMenuItem = (option: MadeByOption): MadeByMenuItem => ({
    value: option.id,
    label: formatMadeByOption(option, currentUserId, t),
  });
  const [sourceOptions, mpdxOptions] = partition(
    options,
    (option) => option.type === AddressChangeMadeByEnum.Source,
  );

  return {
    automatic: sourceOptions.map(toMenuItem),
    mpdx: mpdxOptions.map(toMenuItem),
  };
};
