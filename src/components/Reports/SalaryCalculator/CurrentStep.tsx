import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSalaryCalculator } from './SalaryCalculatorContext/SalaryCalculatorContext';
import { YourInformationStep } from './YourInformation/YourInformation';

export const CurrentStep: React.FC = () => {
  const { currentIndex } = useSalaryCalculator();
  const { t } = useTranslation();

  const steps = [
    <Typography variant="h5" key="effective-date">
      {t('Effective Date')}
    </Typography>,
    <YourInformationStep key="your-information" />,
    <Typography variant="h5" key="salary-calculation">
      {t('Salary Calculation')}
    </Typography>,
    <Typography variant="h5" key="summary">
      {t('Summary')}
    </Typography>,
    <Typography variant="h5" key="receipt">
      {t('Receipt')}
    </Typography>,
  ];

  return steps[currentIndex] ?? null;
};
