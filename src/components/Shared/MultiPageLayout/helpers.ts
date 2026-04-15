import { TFunction } from 'react-i18next';
import { HeaderTypeEnum } from './MultiPageHeader';

export const getHeaderTitleAccess = (
  headerType: HeaderTypeEnum,
  t: TFunction,
): string => {
  switch (headerType) {
    case HeaderTypeEnum.Report:
      return t('Toggle Navigation Panel');
    case HeaderTypeEnum.HrTools:
      return t('Toggle HR Tools Menu');
    case HeaderTypeEnum.Filters:
      return t('Toggle Filters Panel');
    case HeaderTypeEnum.Settings:
      return t('Toggle Preferences Menu');
    case HeaderTypeEnum.MpdxTools:
      return t('Toggle MPDX Tools Menu');
    default:
      return t('Toggle Navigation Panel');
  }
};
