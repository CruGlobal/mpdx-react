import { TFunction } from 'i18next';

export const getHeader = (t: TFunction, step: number): string => {
  switch (step) {
    case 0:
      return 'About this Form';
    case 1:
      return 'Complete the Form';
    case 2:
      return 'Receipt';
    default:
      return '';
  }
};
