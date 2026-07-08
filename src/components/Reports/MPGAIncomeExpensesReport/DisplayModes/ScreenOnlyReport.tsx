import { HourglassDisabled, Settings } from '@mui/icons-material';
import { Box, Container, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EmptyTable } from '../../../HrTools/Shared/EmptyTable/EmptyTable';
import { StyledFilterButton } from '../../Shared/SettingsDialog/StyledFilterButton';
import { CardSkeleton } from '../Card/CardSkeleton';
import { ExpensesPieChart } from '../Charts/ExpensesPieChart';
import { MonthlySummaryChart } from '../Charts/MonthlySummaryChart';
import { SummaryBarChart } from '../Charts/SummaryBarChart';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { TableCard } from '../Tables/TableCard';
import { AllData } from '../mockData';

interface ScreenOnlyReportProps {
  data: AllData;
  last12Months: string[];
  currency: string;
  handleSettingsClick: () => void;
}

export const ScreenOnlyReport: React.FC<ScreenOnlyReportProps> = ({
  data,
  last12Months,
  currency,
  handleSettingsClick,
}) => {
  const { t } = useTranslation();

  return (
    <Box mt={2}>
      <Container>
        <Box mt={2} mb={2}>
          <Grid container spacing={2}>
            <Grid size={7}>
              <CardSkeleton title={t('Summary')} subtitle={t('Last 12 Months')}>
                <SummaryBarChart aspect={2} width={100} currency={currency} />
              </CardSkeleton>
            </Grid>
            <Grid size={5}>
              <CardSkeleton
                title={t('Expenses Categories')}
                subtitle={t('Last 12 Months')}
              >
                <ExpensesPieChart aspect={1.35} width={100} />
              </CardSkeleton>
            </Grid>
          </Grid>
        </Box>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <StyledFilterButton
            variant="outlined"
            startIcon={<Settings />}
            size="small"
            onClick={handleSettingsClick}
          >
            {t('Report Settings')}
          </StyledFilterButton>
        </Box>
        <Box mt={2}>
          <TableCard
            type={ReportTypeEnum.Income}
            data={data.income ?? []}
            emptyPlaceholder={
              <EmptyTable
                title={t('No Income data available')}
                subtitle={t('Data not found in the last 12 months')}
                icon={HourglassDisabled}
              />
            }
            title={t('Income')}
            months={last12Months}
          />
        </Box>
        <Box mt={2}>
          <TableCard
            type={ReportTypeEnum.Expenses}
            data={data.expenses}
            emptyPlaceholder={
              <EmptyTable
                title={t('No Expenses data available')}
                subtitle={t('Data not found in the last 12 months')}
                icon={HourglassDisabled}
              />
            }
            title={t('Expenses')}
            months={last12Months}
          />
        </Box>
        <Box mt={2} mb={2}>
          <CardSkeleton
            title={t('Monthly Summary')}
            subtitle={t('Last 12 Months')}
          >
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
