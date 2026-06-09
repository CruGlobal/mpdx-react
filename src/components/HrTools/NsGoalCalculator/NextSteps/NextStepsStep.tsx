import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NsGoalCalculatorLayout } from '../Shared/NsGoalCalculatorLayout';

export const NextStepsStep: React.FC = () => {
  const { t } = useTranslation();

  return (
    <NsGoalCalculatorLayout
      mainContent={
        <Box mx={4} my={2}>
          <Typography variant="h6">{t('Next Steps')}</Typography>
          <Typography variant="body1" color="textSecondary">
            {t('This step is coming soon.')}
          </Typography>
        </Box>
      }
    />
  );
};
