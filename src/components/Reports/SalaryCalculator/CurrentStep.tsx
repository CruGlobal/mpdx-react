import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EffectiveDateStep } from './EffectiveDateStep/EffectiveDateStep';
import { ReceiptStep } from './Receipt/Receipt';
import { useSalaryCalculator } from './SalaryCalculatorContext/SalaryCalculatorContext';
import { SummaryStep } from './Summary/Summary';
import { YourInformationStep } from './YourInformation/YourInformation';

export const CurrentStep: React.FC = () => {
  const { currentIndex } = useSalaryCalculator();
  const { t } = useTranslation();

  const steps = [
    <EffectiveDateStep key="effective-date" />,
    <YourInformationStep key="your-information" />,
    <Typography variant="h5" key="salary-calculation">
      {t('Salary Calculation')}
    </Typography>,
    <SummaryStep key="summary" />,
    <ReceiptStep key="receipt" />,
  ];

  return steps[currentIndex] ?? null;
};
