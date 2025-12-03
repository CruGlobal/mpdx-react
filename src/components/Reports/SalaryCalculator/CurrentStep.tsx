import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SalaryCalculatorSectionEnum } from './SalaryCalculatorContext/Helper/sharedTypes';
import { useSalaryCalculator } from './SalaryCalculatorContext/SalaryCalculatorContext';
import { YourInformationStep } from './YourInformation/YourInformation';

export const CurrentStep: React.FC = () => {
  const { currentStep } = useSalaryCalculator();
  const { t } = useTranslation();

  switch (currentStep) {
    case SalaryCalculatorSectionEnum.EffectiveDate:
      return <Typography variant="h5">{t('Effective Date')}</Typography>;
    case SalaryCalculatorSectionEnum.YourInformation:
      return <YourInformationStep />;
    case SalaryCalculatorSectionEnum.SalaryCalculation:
      return <Typography variant="h5">{t('Salary Calculation')}</Typography>;
    case SalaryCalculatorSectionEnum.Summary:
      return <Typography variant="h5">{t('Summary')}</Typography>;
    case SalaryCalculatorSectionEnum.Receipt:
      return <Typography variant="h5">{t('Receipt')}</Typography>;
  }
};
