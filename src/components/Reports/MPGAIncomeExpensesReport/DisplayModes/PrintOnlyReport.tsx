import { Box, Container, GlobalStyles, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ExpensesPieChart } from '../Charts/ExpensesPieChart/ExpensesPieChart';
import { MonthlySummaryChart } from '../Charts/MonthlySummaryChart/MonthlySummaryChart';
import { SummaryBarChart } from '../Charts/SummaryBarChart/SummaryBarChart';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { useReport } from '../ReportContext/ReportContext';
import { PrintTables } from '../Tables/PrintTables';

export const PrintOnlyReport: React.FC = () => {
  const { t } = useTranslation();
  const { allData: data } = useReport();

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
              <Grid size={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('Summary')}
                </Typography>
                <SummaryBarChart aspect={2} width={80} />
              </Grid>
              <Grid size={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('Expenses Categories')}
                </Typography>
                <ExpensesPieChart aspect={1.85} width={80} />
              </Grid>
            </Grid>
          </Box>
          <Box mt={2}>
            <PrintTables
              type={ReportTypeEnum.Income}
              data={data.income ?? []}
              title={t('Income')}
            />
          </Box>
          <Box mt={3}>
            <PrintTables
              type={ReportTypeEnum.Expenses}
              data={data.expenses ?? []}
              title={t('Expenses')}
            />
          </Box>
          <Box mt={2}>
            <Typography variant="h6" sx={{ mt: 3 }}>
              {t('Monthly Summary')}
            </Typography>
            <MonthlySummaryChart aspect={2.7} width={80} />
          </Box>
        </Container>
      </Box>
    </>
  );
};
