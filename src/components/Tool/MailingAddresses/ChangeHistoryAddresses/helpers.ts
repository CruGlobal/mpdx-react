import { partition } from 'lodash';
import { TFunction } from 'react-i18next';
import {
  AddressChangeMadeByEnum,
  ContactFilterPartnerEnum,
} from 'src/graphql/types.generated';
import { sourceToStr } from 'src/lib/sourceHelper';
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
