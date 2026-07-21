import React, { useMemo, useState } from 'react';
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
import { SettingsButtonGroup } from '../Shared/SettingsButtonGroup/SettingsButtonGroup';
import {
  Filters,
  SettingsDialog,
} from '../Shared/SettingsDialog/SettingsDialog';
import { DateRange } from '../StaffExpenseReport/Helpers/StaffReportEnum';
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
import { AllData, DataFields } from './mockData';
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

  const [filters, setFilters] = useState<Filters | null>(null);

  const specificYear = filters?.selectedYear ?? null;
  const isYearToDate =
    specificYear === null &&
    filters?.selectedDateRange === DateRange.YearToDate;

  const monthLabels = useGetLastTwelveMonths(locale, specificYear);

  const { startDate, endDate } = useMemo(() => {
    const now = DateTime.now();
    // If a specific year is selected, return start and end of that year
    if (specificYear !== null) {
      const yearStart = DateTime.fromObject({ year: specificYear }).startOf(
        'year',
      );
      return { startDate: yearStart, endDate: yearStart.endOf('year') };
    }
    // If Year to Date is selected, return start of the year to today
    if (isYearToDate) {
      return { startDate: now.startOf('year'), endDate: now };
    }
    return {
      startDate: now.minus({ months: 11 }).startOf('month'),
      endDate: now,
    };
  }, [specificYear, isYearToDate]);

  const defaultFilters: Filters = useMemo(
    () => ({
      selectedDateRange: null,
      startDate,
      endDate,
      categories: null,
    }),
    [startDate, endDate],
  );

  const isFilterActive = useMemo(
    () =>
      Boolean(
        filters &&
          (filters.categories ||
            filters.selectedDateRange === DateRange.YearToDate ||
            (filters.selectedYear !== null &&
              filters.selectedYear !== undefined)),
      ),
    [filters],
  );

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const { data: staffAccountData, error } = useStaffAccountQuery();

  const { data: reportData, loading } = useMpgaTransactionsQuery({
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
              transactions: (month.transactions ?? []).map((transaction) => ({
                transactedAt: transaction.transactedAt,
                description: transaction.description ?? '',
                amount: transaction.amount,
              })),
            })),
          })),
        })),
      })),
    [reportData],
  );

  const { incomeData, expenseData, incomeBreakdown, expenseBreakdown } =
    useFilteredFunds(transformedData, filters?.categories ?? null, t);

  const allData: AllData = useMemo(() => {
    if (!isYearToDate) {
      return {
        income: incomeData,
        expenses: expenseData,
        incomeBreakdown,
        expenseBreakdown,
      };
    }
    // Year to Date queries only the current year, so each row has fewer months than the 12 columns
    const padToColumns = (rows: DataFields[]): DataFields[] =>
      rows.map((row) => {
        const missing = monthLabels.length - row.monthly.length;
        return missing > 0
          ? { ...row, monthly: [...new Array(missing).fill(0), ...row.monthly] }
          : row;
      });
    return {
      income: padToColumns(incomeData),
      expenses: padToColumns(expenseData),
      incomeBreakdown,
      expenseBreakdown,
    };
  }, [
    incomeData,
    expenseData,
    incomeBreakdown,
    expenseBreakdown,
    isYearToDate,
    monthLabels.length,
  ]);

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
                <SettingsButtonGroup
                  isFilterDateSelected={isFilterActive}
                  setFilters={setFilters}
                  handleSettingsClick={handleSettingsClick}
                />
                <Divider orientation="vertical" flexItem />
                <ExportCsvButton data={allData} months={monthLabels} />
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
          <TotalsProvider
            data={allData}
            loading={loading}
            startDate={startDate}
            endDate={endDate}
          >
            <ScreenOnlyReport
              data={allData}
              last12Months={monthLabels}
              currency={currency}
            />
          </TotalsProvider>
        </SimpleScreenOnly>
        <PrintOnly>
          <TotalsProvider
            data={allData}
            loading={loading}
            startDate={startDate}
            endDate={endDate}
          >
            <PrintOnlyReport
              data={allData}
              last12Months={monthLabels}
              currency={currency}
            />
          </TotalsProvider>
        </PrintOnly>
      </Box>
      {isSettingsOpen && (
        <SettingsDialog
          selectedFilters={filters ?? defaultFilters}
          selectedFundType={FundTypes.Primary}
          isOpen={isSettingsOpen}
          onClose={(newFilters) => {
            const hasActiveFilter = Boolean(
              newFilters &&
                (newFilters.categories ||
                  newFilters.selectedDateRange === DateRange.YearToDate ||
                  (newFilters.selectedYear !== null &&
                    newFilters.selectedYear !== undefined)),
            );
            setFilters(hasActiveFilter && newFilters ? newFilters : null);
            setIsSettingsOpen(false);
          }}
          hideDateRange
        />
      )}
    </>
  );
};
