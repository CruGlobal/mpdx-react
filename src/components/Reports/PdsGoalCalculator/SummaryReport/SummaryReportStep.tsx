import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SectionList } from 'src/components/Reports/GoalCalculator/SharedComponents/SectionList';
import { PdsGoalCalculatorLayout } from '../Shared/PdsGoalCalculatorLayout';

export const SummaryReportStep: React.FC = () => {
  const { t } = useTranslation();

  const sections = [{ title: t('MPD Goal'), complete: false }];

  return (
    <PdsGoalCalculatorLayout
      sectionListPanel={<SectionList sections={sections} />}
      mainContent={
        <Typography variant="h5" p={3}>
          {t('Summary Report')}
        </Typography>
      }
    />
  );
};
