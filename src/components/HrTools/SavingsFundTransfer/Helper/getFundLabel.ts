import { TFunction } from 'i18next';
import { FundTypeEnum } from '../mockData';

export const getFundLabel = (fund: string | undefined, t: TFunction) => {
  if (fund === FundTypeEnum.Primary) {
    return t('Primary Account');
  }
  if (fund === FundTypeEnum.Savings) {
    return t('Savings Account');
  }
  if (fund === FundTypeEnum.ConferenceSavings) {
    return t('Staff Conference Savings Account');
  }
  return t('N/A');
};
