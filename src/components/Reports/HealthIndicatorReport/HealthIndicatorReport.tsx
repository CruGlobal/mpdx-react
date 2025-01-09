import { Box, Container, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import MonthlyGoal from 'src/components/Dashboard/MonthlyGoal/MonthlyGoal';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
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
  const { data, loading } = useMonthlyGoalQuery({
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
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MonthlyGoal
                accountListId={accountListId}
                loading={loading}
                goal={data?.accountList.monthlyGoal ?? undefined}
                received={data?.accountList.receivedPledges}
                pledged={data?.accountList.totalPledges}
                totalGiftsNotStarted={data?.contacts.totalCount}
                currencyCode={data?.accountList.currency}
              />
            </Grid>
            <Grid item xs={12}>
              <GraphTitle variant="h5">{t('Health Indicator')}</GraphTitle>
              <HealthIndicatorGraph accountListId={accountListId} />
            </Grid>
          </Grid>
      </Container>
    </Box>
  );
};
