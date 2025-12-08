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

  switch (currentIndex) {
    case 0:
      return <EffectiveDateStep />;
    case 1:
      return <YourInformationStep />;
    case 2:
      return <Typography variant="h5">{t('Salary Calculation')}</Typography>;
    case 3:
      return <SummaryStep />;
    case 4:
      return <ReceiptStep />;
    default:
      return null;
  }
};
