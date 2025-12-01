import { TFunction } from 'i18next';
import { AdditionalSalaryRequestSectionEnum } from '../../AdditionalSalaryRequestHelper';

export const getHeader = (
  t: TFunction,
  step: AdditionalSalaryRequestSectionEnum,
): string => {
  switch (step) {
    case AdditionalSalaryRequestSectionEnum.AboutForm:
      return 'About this Form';
    case AdditionalSalaryRequestSectionEnum.CompleteForm:
      return 'Complete the Form';
    case AdditionalSalaryRequestSectionEnum.Receipt:
      return 'Receipt';
  }
};
