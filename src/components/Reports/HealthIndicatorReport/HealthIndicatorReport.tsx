import React, { useState } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import MonthlyGoal from 'src/components/Dashboard/MonthlyGoal/MonthlyGoal';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { HealthIndicatorFormula } from './HealthIndicatorFormula/HealthIndicatorFormula';
import { HealthIndicatorGraph } from './HealthIndicatorGraph/HealthIndicatorGraph';
import { useMonthlyGoalQuery } from './MonthlyGoal.generated';

const GraphTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));
interface HealthIndicatorReportProps {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const HealthIndicatorReport: React.FC<HealthIndicatorReportProps> = ({
  accountListId,
  isNavListOpen,
  onNavListToggle,
  title,
}) => {
  const { t } = useTranslation();
  const [noHealthIndicatorData, setNoHealthIndicatorData] = useState(false);
  const { data } = useMonthlyGoalQuery({
    variables: {
      accountListId,
    },
  });

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={title}
        headerType={HeaderTypeEnum.Report}
      />
      <Container>
        {noHealthIndicatorData ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" mt={2}>
                {t('No Health Indicator data available')}
              </Typography>
              <Typography variant="body1" mt={2}>
                {t(
                  'There is currently no Health Indicator data available for this account. Please switch to an account that is an MPD Global account. If you are unsure whether you have access to an MPD Global account or need assistance in switching accounts, please reach out to your coach or our support team for guidance.',
                )}
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MonthlyGoal
                accountListId={accountListId}
                accountList={data?.accountList ?? null}
                totalGiftsNotStarted={data?.contacts.totalCount}
              />
            </Grid>
            <Grid item xs={12}>
              <GraphTitle variant="h5">{t('Health Indicator')}</GraphTitle>
              <HealthIndicatorGraph accountListId={accountListId} />
            </Grid>

            <Grid item xs={12}>
              <GraphTitle variant="h5">{t('MPD Health Formula')}</GraphTitle>

              <HealthIndicatorFormula
                accountListId={accountListId}
                noHealthIndicatorData={noHealthIndicatorData}
                setNoHealthIndicatorData={setNoHealthIndicatorData}
              />
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};
