import { TFunction } from 'react-i18next';

const appName = process.env.APP_NAME ?? 'MPDX';

export const sourceToStr = (t: TFunction, source: string): string => {
  switch (source) {
    case 'Siebel':
      return t('US Donation Services');
    case 'DataServer':
      return t('DonorHub');
    case 'MPDX':
      return appName;
    case 'TntImport':
      return t('Tnt Import');
    case 'GoogleImport':
      return t('Google Import');
    default:
      return source;
  }
};
