import { HourglassDisabled } from '@mui/icons-material';
import { Box, Container, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EmptyTable } from '../../../HrTools/Shared/EmptyTable/EmptyTable';
import { CardSkeleton } from '../Card/CardSkeleton';
import { ExpensesPieChart } from '../Charts/ExpensesPieChart/ExpensesPieChart';
import { MonthlySummaryChart } from '../Charts/MonthlySummaryChart/MonthlySummaryChart';
import { SummaryBarChart } from '../Charts/SummaryBarChart/SummaryBarChart';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { useReport } from '../ReportContext/ReportContext';
import { TableCard } from '../Tables/TableCard';

export const ScreenOnlyReport: React.FC = () => {
  const { t } = useTranslation();
  const { allData: data } = useReport();

  return (
    <Box mt={2}>
      <Container>
        <Box mt={2} mb={2}>
          <Grid container spacing={2}>
            <Grid size={7}>
              <CardSkeleton title={t('Summary')}>
                <SummaryBarChart aspect={2} width={100} />
              </CardSkeleton>
            </Grid>
            <Grid size={5}>
              <CardSkeleton title={t('Expenses Categories')}>
                <ExpensesPieChart aspect={1.35} width={100} />
              </CardSkeleton>
            </Grid>
          </Grid>
        </Box>
        <Box mt={2}>
          <TableCard
            type={ReportTypeEnum.Income}
            data={data.income}
            breakdownData={data.incomeBreakdown ?? {}}
            emptyPlaceholder={
              <EmptyTable
                title={t('No Income data available')}
                subtitle={t('Data not found in the last 12 months')}
                icon={HourglassDisabled}
              />
            }
            title={t('Income')}
          />
        </Box>
        <Box mt={2}>
          <TableCard
            type={ReportTypeEnum.Expenses}
            data={data.expenses}
            breakdownData={data.expenseBreakdown ?? {}}
            emptyPlaceholder={
              <EmptyTable
                title={t('No Expenses data available')}
                subtitle={t('Data not found in the last 12 months')}
                icon={HourglassDisabled}
              />
            }
            title={t('Expenses')}
          />
        </Box>
        <Box mt={2} mb={2}>
          <CardSkeleton title={t('Monthly Summary')}>
            <MonthlySummaryChart aspect={2.5} width={100} />
          </CardSkeleton>
        </Box>
      </Container>
    </Box>
  );
};
