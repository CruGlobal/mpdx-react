import React from 'react';
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

const incomeTotal = mockData.income?.data.reduce(
  (sum, data) => sum + data.total,
  0,
);
const ministryTotal = mockData.ministryExpenses?.data.reduce(
  (sum, data) => sum + data.total,
  0,
);
const healthcareTotal = mockData.healthcareExpenses?.data.reduce(
  (sum, data) => sum + data.total,
  0,
);

export const MPGAIncomeExpensesReport: React.FC<
  MPGAIncomeExpensesReportProps
> = ({ title, isNavListOpen, onNavListToggle }) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

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
                  ministryTotal={ministryTotal}
                  healthcareTotal={healthcareTotal}
                />
              </Grid>
              <Grid item xs={5}>
                <ExpensesPieChart
                  incomeTotal={incomeTotal}
                  ministryTotal={ministryTotal}
                  healthcareTotal={healthcareTotal}
                />
              </Grid>
            </Grid>
          </Box>
          <Box>
            <Tables
              data={mockData.income?.data}
              overallTotal={incomeTotal}
              emptyPlaceholder={
                <EmptyTable
                  title={t('No Income data available')}
                  subtitle={t('Data not found in the last 12 months')}
                />
              }
              title={t('Income')}
            />
          </Box>
          <Box mt={2}>
            <Tables
              data={mockData.ministryExpenses?.data}
              overallTotal={ministryTotal}
              emptyPlaceholder={
                <EmptyTable
                  title={t('No Ministry Expenses available')}
                  subtitle={t('Data not found in the last 12 months')}
                />
              }
              title={t('Ministry Expenses')}
            />
          </Box>
          <Box mt={2} mb={2}>
            <Tables
              data={mockData.healthcareExpenses?.data}
              overallTotal={healthcareTotal}
              emptyPlaceholder={
                <EmptyTable
                  title={t('No Healthcare Expenses available')}
                  subtitle={t('Data not found in the last 12 months')}
                />
              }
              title={t('Healthcare Expenses')}
            />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
