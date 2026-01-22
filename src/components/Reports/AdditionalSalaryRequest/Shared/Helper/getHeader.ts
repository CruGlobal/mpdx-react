import i18n from 'src/lib/i18n';
import { AdditionalSalaryRequestSectionEnum } from '../../AdditionalSalaryRequestHelper';

export const getHeader = (step: AdditionalSalaryRequestSectionEnum): string => {
  switch (step) {
    case AdditionalSalaryRequestSectionEnum.AboutForm:
      return i18n.t('About this Form');
    case AdditionalSalaryRequestSectionEnum.CompleteForm:
      return i18n.t('Complete the Form');
    case AdditionalSalaryRequestSectionEnum.Receipt:
      return i18n.t('Receipt');
  }
};
