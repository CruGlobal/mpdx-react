import React, { useMemo } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Container,
  GlobalStyles,
  SvgIcon,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useFilteredFunds } from 'src/hooks/useFilteredFunds';
import { useGetLastTwelveMonths } from 'src/hooks/useGetLastTwelveMonths';
import { useLocale } from 'src/hooks/useLocale';
import { AccountInfoBox } from '../Shared/AccountInfoBox/AccountInfoBox';
import { AccountInfoBoxSkeleton } from '../Shared/AccountInfoBox/AccountInfoBoxSkeleton';
import { useStaffAccountQuery } from '../StaffAccount.generated';
import {
  SimplePrintOnly,
  SimpleScreenOnly,
  StyledPrintButton,
} from '../styledComponents';
import { PrintOnlyReport } from './DisplayModes/PrintOnlyReport';
import { ScreenOnlyReport } from './DisplayModes/ScreenOnlyReport';
import { FundTypes, Funds } from './Helper/MPGAReportEnum';
import { convertMonths } from './Helper/convertMonths';
import {
  getLocalizedCategory,
  getLocalizedSubcategory,
} from './Helper/transformEnums';
import { useReportsStaffExpensesQuery } from './ReportsStaffExpenses.generated';
import { TotalsProvider } from './TotalsContext/TotalsContext';
import { AllData } from './mockData';
import { PrintOnly, StyledHeaderBox } from './styledComponents';

interface MPGAIncomeExpensesReportProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const MPGAIncomeExpensesReport: React.FC<
  MPGAIncomeExpensesReportProps
> = ({ title, isNavListOpen, onNavListToggle }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const handlePrint = () => {
    window.print();
  };

  const last12Months = useGetLastTwelveMonths(locale, true);

  const start = convertMonths(last12Months[0], locale);
  const end = DateTime.now().toISODate();

  const { data: staffAccountData, error } = useStaffAccountQuery();

  const { data: reportData } = useReportsStaffExpensesQuery({
    variables: {
      fundTypes: [FundTypes.Primary],
      startMonth: start,
      endMonth: end,
    },
  });

  const transformedData: Funds[] = useMemo(
    () =>
      (reportData?.reportsStaffExpenses?.funds ?? []).map((fund) => ({
        ...fund,
        categories: (fund.categories ?? []).map((category) => ({
          ...category,
          category: getLocalizedCategory(category.category),
          breakdownByMonth: category.breakdownByMonth.map((month) => ({
            ...month,
          })),
          subcategories: (category.subcategories ?? []).map((subcategory) => ({
            ...subcategory,
            subCategory: getLocalizedSubcategory(subcategory.subCategory),
            breakdownByMonth: subcategory.breakdownByMonth.map((month) => ({
              ...month,
            })),
          })),
        })),
      })),
    [reportData],
  );

  const { incomeData, expenseData } = useFilteredFunds(transformedData);

  const allData: AllData = useMemo(() => {
    return {
      income: incomeData,
      expenses: expenseData,
    };
  }, [incomeData, expenseData]);

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
            {!staffAccountData && !error ? (
              <AccountInfoBoxSkeleton />
            ) : (
              <AccountInfoBox
                name={staffAccountData?.staffAccount?.name}
                accountId={staffAccountData?.staffAccount?.id}
              />
            )}
          </Container>
        </Box>
        <SimpleScreenOnly>
          <TotalsProvider data={allData}>
            <ScreenOnlyReport
              data={allData}
              last12Months={last12Months}
              currency={currency}
            />
          </TotalsProvider>
        </SimpleScreenOnly>
        <PrintOnly>
          <TotalsProvider data={allData}>
            <PrintOnlyReport
              data={allData}
              last12Months={last12Months}
              currency={currency}
            />
          </TotalsProvider>
        </PrintOnly>
      </Box>
    </>
  );
};
