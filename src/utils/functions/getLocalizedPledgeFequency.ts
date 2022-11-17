import { TFunction } from 'react-i18next';
import { PledgeFrequencyEnum } from '../../../graphql/types.generated';

export const getLocalizedPledgeFequency = (
  t: TFunction,
  pledgeFrequency: PledgeFrequencyEnum | null | undefined,
): string => {
  switch (pledgeFrequency) {
    case PledgeFrequencyEnum.Annual:
      return t('Annual');
    case PledgeFrequencyEnum.Every_2Months:
      return t('Every 2 Months');
    case PledgeFrequencyEnum.Every_2Weeks:
      return t('Every 2 Weeks');
    case PledgeFrequencyEnum.Every_2Years:
      return t('Every 2 Years');
    case PledgeFrequencyEnum.Every_4Months:
      return t('Every 4 Months');
    case PledgeFrequencyEnum.Every_6Months:
      return t('Every 6 Months');
    case PledgeFrequencyEnum.Monthly:
      return t('Monthly');
    case PledgeFrequencyEnum.Quarterly:
      return t('Quarterly');
    case PledgeFrequencyEnum.Weekly:
      return t('Weekly');

    default:
      return '';
  }
};
