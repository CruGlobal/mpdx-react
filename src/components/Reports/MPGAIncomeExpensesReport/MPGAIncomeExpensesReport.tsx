import React, { useMemo } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Container,
  GlobalStyles,
  SvgIcon,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { PrintOnlyReport } from './DisplayModes/PrintOnlyReport';
import { ScreenOnlyReport } from './DisplayModes/ScreenOnlyReport';
import { getLast12Months } from './Helper/getLastTwelveMonths';
import { mockData } from './mockData';
import {
  PrintOnly,
  ScreenOnly,
  SimplePrintOnly,
  StyledHeaderBox,
  StyledPrintButton,
} from './styledComponents';

interface MPGAIncomeExpensesReportProps {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const MPGAIncomeExpensesReport: React.FC<
  MPGAIncomeExpensesReportProps
> = ({ title, isNavListOpen, onNavListToggle }) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  const last12Months = useMemo(() => getLast12Months(), []);

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
    <>
      <GlobalStyles
        styles={{
          '@media print': {
            '.MuiSvgIcon-root': {
              display: 'inline !important',
              visibility: 'visible !important',
              width: '24px',
              height: '24px',
            },
          },
          '@page': {
            size: 'landscape',
          },
        }}
      />
      <Box>
        <ScreenOnly>
          <MultiPageHeader
            isNavListOpen={isNavListOpen}
            onNavListToggle={onNavListToggle}
            headerType={HeaderTypeEnum.Report}
            title={title}
          />
        </ScreenOnly>
        <Box mt={2}>
          <Container>
            <StyledHeaderBox>
              <ScreenOnly>
                <Typography variant="h4">
                  {t('Income & Expenses Analysis')}
                </Typography>
              </ScreenOnly>
              <SimplePrintOnly>
                <Typography variant="h4">
                  {t('Income & Expenses Analysis: Last 12 Months')}
                </Typography>
              </SimplePrintOnly>
              <ScreenOnly>
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
              </ScreenOnly>
            </StyledHeaderBox>
            <Box display="flex" flexDirection="row" gap={3} mb={2}>
              <Typography>{mockData.accountName}</Typography>
              <Typography>{mockData.accountListId}</Typography>
            </Box>
          </Container>
        </Box>
        <ScreenOnly>
          <ScreenOnlyReport
            data={mockData}
            incomeTotal={incomeTotal}
            expensesTotal={expensesTotal}
            ministryTotal={ministryTotal}
            healthcareTotal={healthcareTotal}
            miscTotal={miscTotal}
            otherTotal={otherTotal}
            last12Months={last12Months}
            expenseData={expenseData}
          />
        </ScreenOnly>
        <PrintOnly>
          <PrintOnlyReport
            data={mockData}
            incomeTotal={incomeTotal}
            expensesTotal={expensesTotal}
            ministryTotal={ministryTotal}
            healthcareTotal={healthcareTotal}
            miscTotal={miscTotal}
            otherTotal={otherTotal}
            last12Months={last12Months}
            expenseData={expenseData}
          />
        </PrintOnly>
      </Box>
    </>
  );
};
