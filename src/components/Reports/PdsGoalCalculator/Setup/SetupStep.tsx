import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SectionList } from 'src/components/Reports/GoalCalculator/SharedComponents/SectionList';
import { PdsGoalCalculatorLayout } from '../Shared/PdsGoalCalculatorLayout';

export const SetupStep: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PdsGoalCalculatorLayout
      sectionListPanel={
        <SectionList sections={[{ title: t('Setup'), complete: false }]} />
      }
      mainContent={
        <Typography variant="h5" p={3}>
          {t('Settings')}
        </Typography>
      }
    />
  );
};
