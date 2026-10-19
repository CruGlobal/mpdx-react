import { DateTime } from 'luxon';
import { TFunction } from 'react-i18next';
import { ContactFilterPartnerEnum } from 'src/graphql/types.generated';

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
