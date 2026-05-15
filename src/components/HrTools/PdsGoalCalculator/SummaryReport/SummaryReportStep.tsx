import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useAccountListSupportRaisedQuery } from '../../GoalCalculator/Shared/GoalLineItems.generated';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { PdsSummaryTable } from './PdsSummaryTable';

export const SummaryReportStep: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';
  const { calculationLoading } = usePdsGoalCalculator();
  const { data } = useAccountListSupportRaisedQuery({
    variables: { accountListId },
  });
  const supportRaised = data?.accountList.receivedPledges ?? 0;

  if (calculationLoading) {
    return <Loading loading />;
  }

  return (
    <>
      <Box pb={4}>
        <Typography variant="h6">{t('Summary')}</Typography>
        <Typography pt={1}>
          {t(
            'Review your complete PDS goal and current support progress. Use this summary to share your goal and track your fundraising.',
          )}
        </Typography>
      </Box>
      <PdsSummaryTable supportRaised={supportRaised} />
    </>
  );
};
