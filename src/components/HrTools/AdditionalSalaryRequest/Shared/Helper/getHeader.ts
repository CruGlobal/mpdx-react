import { TFunction } from 'i18next';

export const getHeader = (step: number, t: TFunction): string => {
  switch (step) {
    case 0:
      return t('About this Form');
    case 1:
      return t('Complete the Form');
    case 2:
      return t('Receipt');
    default:
      return '';
  }
};
