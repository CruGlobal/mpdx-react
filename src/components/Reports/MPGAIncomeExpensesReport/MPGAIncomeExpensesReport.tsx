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
import { useGetLastTwelveMonths } from 'src/hooks/useGetLastTwelveMonths';
import { useLocale } from 'src/hooks/useLocale';
import { useReportsStaffExpensesQuery } from '../ReportsStaffExpenses.generated';
import {
  SimplePrintOnly,
  SimpleScreenOnly,
  StyledPrintButton,
} from '../styledComponents';
import { PrintOnlyReport } from './DisplayModes/PrintOnlyReport';
import { ScreenOnlyReport } from './DisplayModes/ScreenOnlyReport';
import { TotalsProvider } from './TotalsContext/TotalsContext';
import { mockData } from './mockData';
import { PrintOnly, StyledHeaderBox } from './styledComponents';

interface MPGAIncomeExpensesReportProps {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const MPGAIncomeExpensesReport: React.FC<
  MPGAIncomeExpensesReportProps
> = ({ accountListId, title, isNavListOpen, onNavListToggle }) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data: staffExpensesData } = useReportsStaffExpensesQuery({
    variables: { accountListId: accountListId },
  });

  const handlePrint = () => {
    window.print();
  };

  const last12Months = useGetLastTwelveMonths(locale, true);

  const expenseData = useMemo(
    () => [
      ...(mockData.ministryExpenses ?? []),
      ...(mockData.healthcareExpenses ?? []),
      ...(mockData.misc ?? []),
      ...(mockData.other ?? []),
    ],
    [
      mockData.ministryExpenses,
      mockData.healthcareExpenses,
      mockData.misc,
      mockData.other,
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
        <SimpleScreenOnly>
          <MultiPageHeader
            isNavListOpen={isNavListOpen}
            onNavListToggle={onNavListToggle}
            headerType={HeaderTypeEnum.Report}
            title={title}
          />
        </SimpleScreenOnly>
        <Box mt={2}>
          <Container>
            <StyledHeaderBox>
              <SimpleScreenOnly>
                <Typography variant="h4">
                  {t('Income & Expenses Analysis')}
                </Typography>
              </SimpleScreenOnly>
              <SimplePrintOnly>
                <Typography variant="h4">
                  {t('Income & Expenses Analysis: Last 12 Months')}
                </Typography>
              </SimplePrintOnly>
              <SimpleScreenOnly>
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
              </SimpleScreenOnly>
            </StyledHeaderBox>
            <Box display="flex" flexDirection="row" gap={3} mb={2}>
              <Typography>{mockData.accountName}</Typography>
              <Typography>{mockData.accountListId}</Typography>
            </Box>
          </Container>
        </Box>
        <SimpleScreenOnly>
          <TotalsProvider data={mockData}>
            <ScreenOnlyReport
              data={mockData}
              last12Months={last12Months}
              expenseData={expenseData}
              currency={staffExpensesData?.accountList.currency || 'USD'}
            />
          </TotalsProvider>
        </SimpleScreenOnly>
        <PrintOnly>
          <TotalsProvider data={mockData}>
            <PrintOnlyReport
              data={mockData}
              last12Months={last12Months}
              expenseData={expenseData}
              currency={staffExpensesData?.accountList.currency || 'USD'}
            />
          </TotalsProvider>
        </PrintOnly>
      </Box>
    </>
  );
};
