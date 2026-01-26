import i18n from 'src/lib/i18n';

export const getHeader = (step: number): string => {
  switch (step) {
    case 0:
      return i18n.t('About this Form');
    case 1:
      return i18n.t('Complete the Form');
    case 2:
      return i18n.t('Receipt');
    default:
      return '';
  }
};
