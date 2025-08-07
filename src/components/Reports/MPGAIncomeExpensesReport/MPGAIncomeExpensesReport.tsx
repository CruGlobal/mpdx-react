import React, { useMemo } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Button,
  Container,
  Grid,
  SvgIcon,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';
import { ExpensesPieChart } from './Charts/ExpensesPieChart';
import { MonthlySummaryChart } from './Charts/MonthlySummaryChart';
import { SummaryBarChart } from './Charts/SummaryBarChart';
import { EmptyTable } from './Tables/EmptyTable';
import { Tables } from './Tables/Tables';
import { mockData } from './mockData';

interface MPGAIncomeExpensesReportProps {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

const StyledHeaderBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
});

const StyledPrintButton = styled(Button)({
  border: '1px solid',
  borderRadius: theme.spacing(1),
  marginLeft: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
});

export const MPGAIncomeExpensesReport: React.FC<
  MPGAIncomeExpensesReportProps
> = ({ title, isNavListOpen, onNavListToggle }) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  const getLast12Months = (): string[] => {
    const result: string[] = [];
    const date = new Date();

    for (let i = 0; i < 12; i++) {
      const month = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const formatted = month.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      result.push(formatted);
    }

    return result.reverse();
  };

  const last12Months = useMemo(() => getLast12Months(), []);

  const uniqueYears = [...new Set(last12Months.map((m) => m.split(' ')[1]))];

  const incomeTotal = useMemo(
    () => mockData.income?.data.reduce((sum, data) => sum + data.total, 0),
    [mockData.income?.data],
  );

  const ministryTotal = useMemo(
    () =>
      mockData.ministryExpenses?.data.reduce(
        (sum, data) => sum + data.total,
        0,
      ),
    [mockData.ministryExpenses?.data],
  );

  const healthcareTotal = useMemo(
    () =>
      mockData.healthcareExpenses?.data.reduce(
        (sum, data) => sum + data.total,
        0,
      ),
    [mockData.healthcareExpenses?.data],
  );

  const miscTotal = useMemo(
    () => mockData.misc?.data.reduce((sum, data) => sum + data.total, 0),
    [mockData.misc?.data],
  );

  const otherTotal = useMemo(
    () => mockData.other?.data.reduce((sum, data) => sum + data.total, 0),
    [mockData.other?.data],
  );

  const expensesTotal = useMemo(
    () =>
      (ministryTotal ?? 0) +
      (healthcareTotal ?? 0) +
      (miscTotal ?? 0) +
      (otherTotal ?? 0),
    [ministryTotal, healthcareTotal, miscTotal, otherTotal],
  );

  const expenseData = useMemo(
    () => [
      ...(mockData.ministryExpenses?.data ?? []),
      ...(mockData.healthcareExpenses?.data ?? []),
      ...(mockData.misc?.data ?? []),
      ...(mockData.other?.data ?? []),
    ],
    [
      mockData.ministryExpenses?.data,
      mockData.healthcareExpenses?.data,
      mockData.misc?.data,
      mockData.other?.data,
    ],
  );

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        headerType={HeaderTypeEnum.Report}
        title={title}
      />
      <Box mt={2}>
        <Container>
          <StyledHeaderBox>
            <Typography variant="h4">
              {t('Income & Expenses Analysis')}
            </Typography>
            <StyledPrintButton
              startIcon={
                <SvgIcon fontSize="small">
                  <PrintIcon titleAccess={t('Print')} />
                </SvgIcon>
              }
              onClick={handlePrint}
            >
              {t('Print')}
            </StyledPrintButton>
          </StyledHeaderBox>
          <Box display="flex" flexDirection="row" gap={3} mb={2}>
            <Typography>{mockData.accountName}</Typography>
            <Typography>{mockData.accountListId}</Typography>
          </Box>
          <Box mt={2} mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={7}>
                <SummaryBarChart
                  incomeTotal={incomeTotal}
                  expensesTotal={expensesTotal}
                />
              </Grid>
              <Grid item xs={5}>
                <ExpensesPieChart
                  ministryExpenses={ministryTotal}
                  healthcareExpenses={healthcareTotal}
                  misc={miscTotal}
                  other={otherTotal}
                />
              </Grid>
            </Grid>
          </Box>
          <Box>
            <Tables
              data={mockData.income?.data ?? []}
              overallTotal={incomeTotal}
              emptyPlaceholder={
                <EmptyTable
                  title={t('No Income data available')}
                  subtitle={t('Data not found in the last 12 months')}
                />
              }
              title={t('Income')}
              months={last12Months}
              years={uniqueYears}
            />
          </Box>
          <Box mt={2}>
            <Tables
              data={expenseData}
              overallTotal={expensesTotal}
              emptyPlaceholder={
                <EmptyTable
                  title={t('No Expenses data available')}
                  subtitle={t('Data not found in the last 12 months')}
                />
              }
              title={t('Expenses')}
              months={last12Months}
              years={uniqueYears}
            />
          </Box>
          <Box mt={2} mb={2}>
            <MonthlySummaryChart
              incomeData={mockData.income?.data ?? []}
              expenseData={expenseData}
              months={last12Months}
            />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
