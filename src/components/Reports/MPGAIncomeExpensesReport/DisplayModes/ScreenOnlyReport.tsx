import { HourglassDisabled } from '@mui/icons-material';
import { Box, Container, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EmptyTable } from '../../../HrTools/Shared/EmptyTable/EmptyTable';
import { CardSkeleton } from '../Card/CardSkeleton';
import { ExpensesPieChart } from '../Charts/ExpensesPieChart/ExpensesPieChart';
import { MonthlySummaryChart } from '../Charts/MonthlySummaryChart/MonthlySummaryChart';
import { SummaryBarChart } from '../Charts/SummaryBarChart/SummaryBarChart';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { TableCard } from '../Tables/TableCard';
import { AllData } from '../mockData';

interface ScreenOnlyReportProps {
  data: AllData;
  subtitle: string;
  last12Months: string[];
  currency: string;
}

export const ScreenOnlyReport: React.FC<ScreenOnlyReportProps> = ({
  data,
  subtitle,
  last12Months,
  currency,
}) => {
  const { t } = useTranslation();

  return (
    <Box mt={2}>
      <Container>
        <Box mt={2} mb={2}>
          <Grid container spacing={2}>
            <Grid size={7}>
              <CardSkeleton title={t('Summary')} subtitle={subtitle}>
                <SummaryBarChart aspect={2} width={100} currency={currency} />
              </CardSkeleton>
            </Grid>
            <Grid size={5}>
              <CardSkeleton
                title={t('Expenses Categories')}
                subtitle={subtitle}
              >
                <ExpensesPieChart aspect={1.35} width={100} />
              </CardSkeleton>
            </Grid>
          </Grid>
        </Box>
        <Box mt={2}>
          <TableCard
            type={ReportTypeEnum.Income}
            data={data.income ?? []}
            breakdownData={data.incomeBreakdown ?? {}}
            emptyPlaceholder={
              <EmptyTable
                title={t('No Income data available')}
                subtitle={t('Data not found in the last 12 months')}
                icon={HourglassDisabled}
              />
            }
            title={t('Income')}
            subtitle={subtitle}
            months={last12Months}
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
            subtitle={subtitle}
            months={last12Months}
          />
        </Box>
        <Box mt={2} mb={2}>
          <CardSkeleton title={t('Monthly Summary')} subtitle={subtitle}>
            <MonthlySummaryChart
              incomeData={data.income ?? []}
              expenseData={data.expenses ?? []}
              months={last12Months}
              aspect={2.5}
              width={100}
              currency={currency}
            />
          </CardSkeleton>
        </Box>
      </Container>
    </Box>
  );
};
