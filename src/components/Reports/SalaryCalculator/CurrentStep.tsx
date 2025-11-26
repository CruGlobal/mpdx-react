import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SalaryCalculatorSectionEnum } from './SalaryCalculatorContext/Helper/sharedTypes';
import { useSalaryCalculator } from './SalaryCalculatorContext/SalaryCalculatorContext';

export const CurrentStep: React.FC = () => {
  const { currentStep } = useSalaryCalculator();
  const { t } = useTranslation();

  switch (currentStep) {
    case SalaryCalculatorSectionEnum.EffectiveDate:
      return <Typography variant="h5">{t('Effective Date')}</Typography>;
    case SalaryCalculatorSectionEnum.PersonalInformation:
      return <Typography variant="h5">{t('Personal Information')}</Typography>;
    case SalaryCalculatorSectionEnum.MHARequest:
      return <Typography variant="h5">{t('MHA Request')}</Typography>;
    case SalaryCalculatorSectionEnum.Contribution403b:
      return <Typography variant="h5">{t('403b Contribution')}</Typography>;
    case SalaryCalculatorSectionEnum.MaxAllowableSalary:
      return <Typography variant="h5">{t('Max Allowable Salary')}</Typography>;
    case SalaryCalculatorSectionEnum.RequestedSalary:
      return <Typography variant="h5">{t('Requested Salary')}</Typography>;
    case SalaryCalculatorSectionEnum.Summary:
      return <Typography variant="h5">{t('Summary')}</Typography>;
    case SalaryCalculatorSectionEnum.AdditionalInformation:
      return (
        <Typography variant="h5">{t('Additional Information')}</Typography>
      );
    case SalaryCalculatorSectionEnum.Receipt:
      return <Typography variant="h5">{t('Receipt')}</Typography>;
  }
};
