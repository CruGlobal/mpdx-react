import { TFunction } from 'react-i18next';

export const sourceToStr = (t: TFunction, source: string): string => {
  switch (source) {
    case 'Siebel':
      return t('US Donation Services');
    case 'DataServer':
      return t('DonorHub');
    case 'MPDX':
      return t('MPDX');
    case 'TntImport':
      return t('Tnt Import');
    case 'GoogleImport':
      return t('Google Import');
    default:
      return t('MPDX');
  }
};
