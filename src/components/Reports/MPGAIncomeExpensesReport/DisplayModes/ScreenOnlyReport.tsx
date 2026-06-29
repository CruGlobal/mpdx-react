import { useState } from 'react';
import { HourglassDisabled, Settings } from '@mui/icons-material';
import { Box, Container, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EmptyTable } from '../../../HrTools/Shared/EmptyTable/EmptyTable';
import {
  Filters,
  SettingsDialog,
} from '../../StaffExpenseReport/SettingsDialog/SettingsDialog';
import { StyledFilterButton } from '../../StaffExpenseReport/StaffExpenseReport';
import { CardSkeleton } from '../Card/CardSkeleton';
import { ExpensesPieChart } from '../Charts/ExpensesPieChart';
import { MonthlySummaryChart } from '../Charts/MonthlySummaryChart';
import { SummaryBarChart } from '../Charts/SummaryBarChart';
import { FundTypes, ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { TableCard } from '../Tables/TableCard';
import { AllData } from '../mockData';

interface ScreenOnlyReportProps {
  data: AllData;
  last12Months: string[];
  currency: string;
  selectedFilters: Filters;
  onFiltersChange: (newFilters: Filters) => void;
}

export const ScreenOnlyReport: React.FC<ScreenOnlyReportProps> = ({
  data,
  last12Months,
  currency,
  selectedFilters,
  onFiltersChange,
}) => {
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  return (
    <Box mt={2}>
      <Container>
        <Box mt={2} mb={2}>
          <Grid container spacing={2}>
            <Grid item xs={7}>
              <CardSkeleton title={t('Summary')} subtitle={t('Last 12 Months')}>
                <SummaryBarChart aspect={2} width={100} currency={currency} />
              </CardSkeleton>
            </Grid>
            <Grid item xs={5}>
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
      {isSettingsOpen && (
        <SettingsDialog
          selectedFilters={selectedFilters}
          selectedFundType={FundTypes.Primary}
          isOpen={isSettingsOpen}
          onClose={(newFilters) => {
            if (newFilters) {
              onFiltersChange(newFilters);
            }
            setIsSettingsOpen(false);
          }}
          showDateRange
        />
      )}
    </Box>
  );
};
