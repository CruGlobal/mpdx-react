import { useRouter } from 'next/router';
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GoalCalculatorStepEnum } from './GoalCalculatorHelper';

export const GoalsList: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  // You can replace this with actual user name from context/props
  const userName = 'User'; // TODO: Get actual user name

  const handleCreateGoal = () => {
    router.push(
      `${router.asPath}/${GoalCalculatorStepEnum.CalculatorSettings}`,
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        {t('Good Afternoon, {{name}}', { name: userName })}
      </Typography>

      <Typography sx={{ mb: 3 }}>
        {t('Welcome to the MPD Goal Calculator.')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={handleCreateGoal}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          {t('Create a New Goal')}
        </Button>

        <Button
          variant="outlined"
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'primary.light',
            },
          }}
        >
          {t('Learn About Goal Settings')}
        </Button>
      </Box>
    </Box>
  );
};
