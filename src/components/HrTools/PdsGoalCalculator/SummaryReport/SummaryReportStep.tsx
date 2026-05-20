import React from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useAccountListSupportRaisedQuery } from '../../GoalCalculator/Shared/GoalLineItems.generated';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { PdsSummaryTable } from './PdsSummaryTable';

export const SummaryReportStep: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';
  const { calculationLoading } = usePdsGoalCalculator();
  const { data, error } = useAccountListSupportRaisedQuery({
    variables: { accountListId },
  });
  const supportRaised = data?.accountList.receivedPledges ?? 0;

  if (calculationLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <>
      <Box pb={4}>
        <Typography variant="h6" component="h2">
          {t('Summary')}
        </Typography>
        <Typography pt={1}>
          {t(
            'Review your complete PDS goal and current support progress. Use this summary to share your goal and track your fundraising.',
          )}
        </Typography>
      </Box>
      {error ? (
        <Alert severity="error">
          {t('Failed to load support progress. Please try again.')}
        </Alert>
      ) : (
        <PdsSummaryTable supportRaised={supportRaised} />
      )}
    </>
  );
};
