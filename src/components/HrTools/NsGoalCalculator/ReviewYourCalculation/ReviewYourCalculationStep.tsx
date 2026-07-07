import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NsGoalCalculation } from '../Shared/NsGoalCalculatorContext';

interface ReviewYourCalculationStepProps {
  goalCalculation: NsGoalCalculation;
}

export const ReviewYourCalculationStep: React.FC<
  ReviewYourCalculationStepProps
> = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h6">{t('Review Your Calculation')}</Typography>
      <Typography variant="body1" color="textSecondary">
        {t('This step is coming soon.')}
      </Typography>
    </>
  );
};
