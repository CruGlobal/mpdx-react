import React, { useMemo, useState } from 'react';
import { Settings } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Container,
  Divider,
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
import { useStaffAccountQuery } from 'src/components/Shared/StaffAccount/StaffAccount.generated';
import { useFilteredFunds } from 'src/hooks/useFilteredFunds';
import { useGetLastTwelveMonths } from 'src/hooks/useGetLastTwelveMonths';
import { useLocale } from 'src/hooks/useLocale';
import { AccountInfoBox } from '../../HrTools/Shared/AccountInfoBox/AccountInfoBox';
import { AccountInfoBoxSkeleton } from '../../HrTools/Shared/AccountInfoBox/AccountInfoBoxSkeleton';
import {
  Filters,
  SettingsDialog,
  getFiltersWithCalculatedDates,
} from '../Shared/SettingsDialog/SettingsDialog';
import { StyledFilterButton } from '../Shared/SettingsDialog/StyledFilterButton';
import {
  SimplePrintOnly,
  SimpleScreenOnly,
  StyledPrintButton,
} from '../styledComponents';
import { PrintOnlyReport } from './DisplayModes/PrintOnlyReport';
import { ScreenOnlyReport } from './DisplayModes/ScreenOnlyReport';
import { ExportCsvButton } from './ExportCsvButton/ExportCsvButton';
import { FundTypes, Funds } from './Helper/MPGAReportEnum';
import { useMpgaTransactionsQuery } from './MPGATransactions.generated';
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const last12Months = useGetLastTwelveMonths(locale, true);

  const { startDate, endDate } = useMemo(() => {
    const now = DateTime.now();
    return {
      startDate: now.minus({ months: 11 }).startOf('month'),
      endDate: now,
    };
  }, []);

  const [filters, setFilters] = useState<Filters>(() =>
    getFiltersWithCalculatedDates({
      selectedDateRange: null,
      startDate: startDate,
      endDate: endDate.endOf('month'),
      categories: null,
    }),
  );

  const onFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const { data: staffAccountData, error } = useStaffAccountQuery();

  const { data: reportData } = useMpgaTransactionsQuery({
    variables: {
      fundTypes: [FundTypes.Primary],
      startMonth: startDate.toISODate(),
      endMonth: endDate.toISODate(),
    },
  });

  const transformedData: Funds[] = useMemo(
    () =>
      (reportData?.reportsStaffExpenses?.funds ?? []).map((fund) => ({
        ...fund,
        categories: (fund.categories ?? []).map((category) => ({
          ...category,
          category: category.category,
          breakdownByMonth: category.breakdownByMonth.map((month) => ({
            ...month,
          })),
          subcategories: (category.subcategories ?? []).map((subcategory) => ({
            ...subcategory,
            subCategory: subcategory.subCategory,
            breakdownByMonth: subcategory.breakdownByMonth.map((month) => ({
              ...month,
            })),
          })),
        })),
      })),
    [reportData],
  );

  const { incomeData, expenseData } = useFilteredFunds(
    transformedData,
    filters?.categories ?? null,
    t,
  );

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
              <SimpleScreenOnly
                display="flex"
                alignItems="center"
                sx={{ gap: 2, '& > button': { ml: 0 } }}
              >
                <StyledFilterButton
                  variant="outlined"
                  startIcon={<Settings />}
                  size="small"
                  onClick={handleSettingsClick}
                >
                  {t('Report Settings')}
                </StyledFilterButton>
                <Divider orientation="vertical" flexItem />
                <ExportCsvButton data={allData} months={last12Months} />
                <StyledPrintButton
                  startIcon={
                    <SvgIcon fontSize="small">
                      <PrintIcon />
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
      {isSettingsOpen && (
        <SettingsDialog
          selectedFilters={filters}
          selectedFundType={FundTypes.Primary}
          isOpen={isSettingsOpen}
          onClose={(newFilters) => {
            if (newFilters) {
              onFiltersChange(newFilters);
            }
            setIsSettingsOpen(false);
          }}
          hideDateRange
        />
      )}
    </>
  );
};
