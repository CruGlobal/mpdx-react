import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSalaryCalculator } from './SalaryCalculatorContext/SalaryCalculatorContext';
import { YourInformationStep } from './YourInformation/YourInformation';

export const CurrentStep: React.FC = () => {
  const { currentIndex } = useSalaryCalculator();
  const { t } = useTranslation();

  switch (currentIndex) {
    case 0:
      return <Typography variant="h5">{t('Effective Date')}</Typography>;
    case 1:
      return <YourInformationStep />;
    case 2:
      return <Typography variant="h5">{t('Salary Calculation')}</Typography>;
    case 3:
      return <Typography variant="h5">{t('Summary')}</Typography>;
    case 4:
      return <Typography variant="h5">{t('Receipt')}</Typography>;
    default:
      return null;
  }
};
