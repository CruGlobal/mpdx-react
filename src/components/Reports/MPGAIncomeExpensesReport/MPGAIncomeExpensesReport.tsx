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
import { monthYearFormat } from 'src/lib/intlFormat';
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

  const selectedYear = filters?.selectedYear ?? null;
  const isYearToDate =
    selectedYear === null &&
    filters?.selectedDateRange === DateRange.YearToDate;

  const effectiveYear =
    selectedYear ?? (isYearToDate ? DateTime.now().year : null);

  const monthLabels = useGetLastTwelveMonths(locale, effectiveYear);

  const { startDate, endDate } = useMemo(() => {
    const now = DateTime.now();
    // If a year is selected, show the full year
    if (effectiveYear !== null) {
      const yearStart = DateTime.fromObject({ year: effectiveYear }).startOf(
        'year',
      );
      const yearEnd = yearStart.endOf('year');
      return { startDate: yearStart, endDate: yearEnd < now ? yearEnd : now };
    }
    // If no year is selected, default to the last 12 months
    return {
      startDate: now.minus({ months: 11 }).startOf('month'),
      endDate: now,
    };
  }, [effectiveYear]);

  // If year to date filter is selected, get first month index in the future to gray out future months in the table
  const firstFutureMonthIndex = isYearToDate ? DateTime.now().month : undefined;

  const subtitle = useMemo(() => {
    if (selectedYear === null && !isYearToDate) {
      return t('Last 12 Months');
    }
    return t('{{startMonth}} – {{endMonth}}', {
      startMonth: monthYearFormat(
        startDate.month,
        startDate.year,
        locale,
        true,
        true,
      ),
      endMonth: monthYearFormat(
        endDate.month,
        endDate.year,
        locale,
        true,
        true,
      ),
    });
  }, [selectedYear, isYearToDate, startDate, endDate, locale, t]);

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

    // Year to Date only has data through the current month so fill the remaining months
    const addFutureData = (rows: DataFields[]): DataFields[] =>
      rows.map((row) => ({
        ...row,
        monthly: monthLabels.map((_month, index) =>
          firstFutureMonthIndex !== undefined && index >= firstFutureMonthIndex
            ? 0
            : (row.monthly?.[index] ?? 0),
        ),
      }));

    return {
      income: addFutureData(incomeData),
      expenses: addFutureData(expenseData),
      incomeBreakdown,
      expenseBreakdown,
    };
  }, [
    incomeData,
    expenseData,
    incomeBreakdown,
    expenseBreakdown,
    isYearToDate,
    monthLabels,
    firstFutureMonthIndex,
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
                  {t('Income & Expenses Analysis: {{subtitle}}', { subtitle })}
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
              subtitle={subtitle}
              last12Months={monthLabels}
              firstFutureMonthIndex={firstFutureMonthIndex}
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
              firstFutureMonthIndex={firstFutureMonthIndex}
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
