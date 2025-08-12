import { Box, Container, GlobalStyles, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ExpensesPieChart } from '../Charts/ExpensesPieChart';
import { MonthlySummaryChart } from '../Charts/MonthlySummaryChart';
import { SummaryBarChart } from '../Charts/SummaryBarChart';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { PrintTables } from '../Tables/PrintTables';
import { DataFields, MockData } from '../mockData';

interface PrintOnlyReportProps {
  data: MockData;
  incomeTotal: number | undefined;
  expensesTotal: number | undefined;
  ministryTotal: number | undefined;
  healthcareTotal: number | undefined;
  miscTotal: number | undefined;
  otherTotal: number | undefined;
  last12Months: string[];
  expenseData: DataFields[];
}

export const PrintOnlyReport: React.FC<PrintOnlyReportProps> = ({
  data,
  incomeTotal,
  expensesTotal,
  ministryTotal,
  healthcareTotal,
  miscTotal,
  otherTotal,
  last12Months,
  expenseData,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <GlobalStyles
        styles={{
          '@media print': {
            '.print-grid .MuiGrid-item': {
              flexBasis: '100% !important',
              maxWidth: '100% !important',
            },
            '.print-grid svg': { maxWidth: 'none !important' },
            '.print-grid': {
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            },
          },
        }}
      />
      <Box mt={2}>
        <Container>
          <Box mt={2} mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('Summary')}
                </Typography>
                <SummaryBarChart
                  incomeTotal={incomeTotal}
                  expensesTotal={expensesTotal}
                  aspect={2}
                  width={80}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('Expenses Categories')}
                </Typography>
                <ExpensesPieChart
                  ministryExpenses={ministryTotal}
                  healthcareExpenses={healthcareTotal}
                  misc={miscTotal}
                  other={otherTotal}
                  aspect={1.85}
                  width={80}
                />
              </Grid>
            </Grid>
          </Box>
          <Box mt={2}>
            <PrintTables
              type={ReportTypeEnum.Income}
              data={data.income?.data}
              overallTotal={incomeTotal}
              title={t('Income')}
              months={last12Months}
            />
          </Box>
          <Box mt={3}>
            <PrintTables
              type={ReportTypeEnum.Expenses}
              data={expenseData}
              overallTotal={expensesTotal}
              title={t('Expenses')}
              months={last12Months}
            />
          </Box>
          <Box mt={2}>
            <Typography variant="h6" sx={{ mt: 3 }}>
              {t('Monthly Summary')}
            </Typography>
            <MonthlySummaryChart
              incomeData={data.income?.data ?? []}
              expenseData={expenseData}
              months={last12Months}
              aspect={2.7}
              width={80}
            />
          </Box>
        </Container>
      </Box>
    </>
  );
};
