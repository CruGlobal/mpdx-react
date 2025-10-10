import React, { useEffect, useMemo, useState } from 'react';
import {
  FilterListOff,
  Groups,
  Savings,
  Settings,
  Wallet,
} from '@mui/icons-material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Button,
  Container,
  Divider,
  SvgIcon,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  Fund,
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import theme from 'src/theme';
import { AccountInfoBox } from '../Shared/AccountInfoBox/AccountInfoBox';
import { AccountInfoBoxSkeleton } from '../Shared/AccountInfoBox/AccountInfoBoxSkeleton';
import { EmptyTable } from '../Shared/EmptyTable/EmptyTable';
import { useStaffAccountQuery } from '../StaffAccount.generated';
import {
  SimplePrintOnly,
  SimpleScreenOnly,
  StyledPrintButton,
} from '../styledComponents';
import { BalanceCard } from './BalanceCard/BalanceCard';
import { BalanceCardSkeleton } from './BalanceCard/BalanceCardSkeleton';
import { PrintHeader } from './BalanceCard/PrintHeader';
import { DownloadButtonGroup } from './DownloadButtonGroup/DownloadButtonGroup';
import { useReportsStaffExpensesQuery } from './GetStaffExpense.generated';
import { ReportType } from './Helpers/StaffReportEnum';
import { filterTransactions } from './Helpers/filterTransactions';
import {
  dateRangeToString,
  getFormattedDateString,
} from './Helpers/formatDate';
import { Filters, SettingsDialog } from './SettingsDialog/SettingsDialog';
import { PrintTables } from './Tables/PrintTables';
import { StaffReportTable } from './Tables/StaffReportTable';

const StyledHeaderBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
});

const StyledTimeNavBox = styled(Box)({
  display: 'flex',
  margin: 0,
  gap: theme.spacing(2),
});

const StyledFilterButton = styled(Button)({
  color: theme.palette.cruGrayDark.main,
  borderColor: theme.palette.cruGrayDark.main,
  '&:hover': {
    backgroundColor: theme.palette.cruGrayLight.main,
    borderColor: theme.palette.cruGrayDark.main,
  },
});

const StyledCardsBox = styled(Box)({
  flex: 1,
  minWidth: 250,
  display: 'flex',
  gap: theme.spacing(4),
});

export interface Transaction {
  id: string;
  amount: number;
  transactedAt: string;
  description?: string | null;
  fundType: string;
  category: StaffExpenseCategoryEnum;
  subcategory?: StaffExpensesSubCategoryEnum;
  displayCategory: string;
}

interface StaffExpenseReportProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const StaffExpenseReport: React.FC<StaffExpenseReportProps> = ({
  isNavListOpen,
  onNavListToggle,
  title,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [time, setTime] = useState(DateTime.now().startOf('month'));

  const isFilterDateSelected = useMemo(() => {
    return Boolean(
      filters &&
        (filters.startDate || filters.endDate || filters.selectedDateRange),
    );
  }, [filters]);

  const { data, loading } = useReportsStaffExpensesQuery({
    variables: {
      startMonth:
        filters?.startDate?.startOf('month').toISODate() ??
        filters?.endDate?.startOf('month').toISODate() ??
        time.startOf('month').toISODate(),
      endMonth:
        filters?.endDate?.endOf('month').toISODate() ??
        time.endOf('month').toISODate(),
    },
  });

  const { data: accountData } = useStaffAccountQuery();
  const { id, name } = accountData?.staffAccount ?? {};

  const handlePrint = () => window.print();

  const timeTitle = time.toJSDate().toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const hasNext = time.hasSame(DateTime.now(), 'month');

  const allFunds: Fund[] = useMemo(
    () =>
      (data?.reportsStaffExpenses?.funds ?? []).toSorted((a, b) =>
        a.id.localeCompare(b.id),
      ),
    [data],
  );

  const defaultFundType: string | null =
    allFunds.find((f) => f.fundType === 'Primary')?.fundType ??
    allFunds[0]?.fundType ??
    null;

  const [selectedFundType, setSelectedFundType] = useState<string | null>(
    defaultFundType,
  );

  useEffect(() => {
    if (!selectedFundType && defaultFundType) {
      setSelectedFundType(defaultFundType);
    }
  }, [selectedFundType, defaultFundType]);

  const selectedFund = allFunds.find(
    (fund) => fund.fundType === selectedFundType,
  );

  const setPrevMonth = () => {
    const prevTime = time.minus({ months: 1 });
    setTime(prevTime);
  };

  const setNextMonth = () => {
    const nextTime = time.plus({ months: 1 });
    setTime(nextTime);
  };

  const transactions = useMemo(() => {
    const newTransactions: Record<
      string,
      { income: Transaction[]; expenses: Transaction[] }
    > = {};

    allFunds.forEach((fund) => {
      const incomeTransactions = filterTransactions({
        tableType: ReportType.Income,
        targetTime: time,
        fund,
        filters,
        t,
      });
      const expenseTransactions = filterTransactions({
        tableType: ReportType.Expense,
        targetTime: time,
        fund,
        filters,
        t,
      });

      newTransactions[fund.fundType] = {
        income: incomeTransactions,
        expenses: expenseTransactions,
      };
    });

    return newTransactions;
  }, [allFunds, time, t, filters]);

  const handleCardClick = (fundType: string) => {
    setSelectedFundType(fundType);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const getPosOrNegTransactions = (tableType: ReportType, fundType: string) => {
    const fundTransactions = transactions[fundType];

    return tableType === ReportType.Income
      ? fundTransactions.income
      : fundTransactions.expenses;
  };

  const getFilteredTotals = (tableType: ReportType, fundType: string) => {
    const filtered = getPosOrNegTransactions(tableType, fundType);
    return filtered.reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const transferTotals = useMemo(() => {
    const totals: Record<string, { in: number; out: number }> = {};

    for (const [fundType, fundTransactions] of Object.entries(transactions)) {
      totals[fundType] = {
        in: fundTransactions.income.reduce(
          (sum, transaction) => sum + transaction.amount,
          0,
        ),
        out: fundTransactions.expenses.reduce(
          (sum, transaction) => sum + transaction.amount,
          0,
        ),
      };
    }

    return totals;
  }, [transactions]);

  const filterTimeTitle = useMemo(() => {
    if (filters?.selectedDateRange) {
      return dateRangeToString(filters.selectedDateRange, locale);
    } else if (filters?.startDate && filters?.endDate) {
      return getFormattedDateString(filters.startDate, filters.endDate, locale);
    } else if (filters?.startDate && !filters?.endDate) {
      return getFormattedDateString(filters.startDate, DateTime.now(), locale);
    } else if (!filters?.startDate && filters?.endDate) {
      return getFormattedDateString(
        filters.endDate.startOf('month'),
        filters.endDate,
        locale,
      );
    }
    return null;
  }, [filters, locale, t]);

  return (
    <Box>
      <SimpleScreenOnly>
        <MultiPageHeader
          isNavListOpen={isNavListOpen}
          onNavListToggle={onNavListToggle}
          title={title}
          headerType={HeaderTypeEnum.Report}
        />
      </SimpleScreenOnly>
      <Box mt={2}>
        <Container>
          <Box>
            <StyledHeaderBox>
              <SimplePrintOnly>
                <Typography variant="h4">
                  {t('Income and Expenses: {{timeTitle}}', {
                    timeTitle: timeTitle,
                  })}
                </Typography>
              </SimplePrintOnly>
              <SimpleScreenOnly>
                <Typography variant="h4">{t('Income and Expenses')}</Typography>
              </SimpleScreenOnly>
              {Object.values(transactions).some(
                (fundTransactions) =>
                  fundTransactions.income.length ||
                  fundTransactions.expenses.length,
              ) ? (
                <SimpleScreenOnly
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                  gap={1}
                >
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
              ) : null}
            </StyledHeaderBox>
            {loading ? (
              <AccountInfoBoxSkeleton />
            ) : (
              <AccountInfoBox name={name} accountId={id} />
            )}
            <SimpleScreenOnly>
              <Box
                display="flex"
                flexWrap="wrap"
                gap={2}
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                {loading ? (
                  <StyledCardsBox>
                    <BalanceCardSkeleton />
                    <BalanceCardSkeleton />
                  </StyledCardsBox>
                ) : (
                  allFunds.map((fund) => (
                    <StyledCardsBox key={fund.fundType}>
                      <BalanceCard
                        fundType={fund.fundType}
                        icon={
                          fund.fundType === 'Primary'
                            ? Wallet
                            : fund.fundType === 'Savings'
                              ? Savings
                              : Groups
                        }
                        iconBgColor={
                          fund.fundType === 'Primary'
                            ? theme.palette.chartOrange.main
                            : fund.fundType === 'Savings'
                              ? theme.palette.chartBlueDark.main
                              : theme.palette.chartBlue.main
                        }
                        title={fund.fundType}
                        isSelected={selectedFundType === fund.fundType}
                        startingBalance={
                          data?.reportsStaffExpenses.startBalance ?? 0
                        }
                        endingBalance={
                          data?.reportsStaffExpenses.endBalance ?? 0
                        }
                        transfersIn={transferTotals[fund.fundType]?.in ?? 0}
                        transfersOut={transferTotals[fund.fundType]?.out ?? 0}
                        onClick={handleCardClick}
                      />
                    </StyledCardsBox>
                  ))
                )}
              </Box>
            </SimpleScreenOnly>
            <SimplePrintOnly>
              <Box>
                {selectedFundType && (
                  <PrintHeader
                    icon={
                      selectedFundType === 'Primary'
                        ? Wallet
                        : selectedFundType === 'Savings'
                          ? Savings
                          : Groups
                    }
                    iconColor={
                      selectedFundType === 'Primary'
                        ? theme.palette.chartOrange.main
                        : selectedFundType === 'Savings'
                          ? theme.palette.chartBlueDark.main
                          : theme.palette.chartBlue.main
                    }
                    title={selectedFundType}
                    startBalance={data?.reportsStaffExpenses.startBalance ?? 0}
                    endBalance={data?.reportsStaffExpenses.endBalance ?? 0}
                    transfersIn={transferTotals[selectedFundType]?.in ?? 0}
                    transfersOut={transferTotals[selectedFundType]?.out ?? 0}
                  />
                )}
              </Box>
            </SimplePrintOnly>
          </Box>
        </Container>
      </Box>
      <SimpleScreenOnly mt={2} mb={2}>
        <Container>
          <Divider />
        </Container>
      </SimpleScreenOnly>
      <SimpleScreenOnly mt={2}>
        <Container>
          <StyledTimeNavBox>
            {!filters ? (
              <Typography variant="h6">{timeTitle}</Typography>
            ) : (
              <Typography variant="h6">{filterTimeTitle}</Typography>
            )}
            {!isFilterDateSelected ? (
              <>
                <Button
                  style={{ marginLeft: 'auto', maxHeight: 35 }}
                  variant="contained"
                  startIcon={<ChevronLeftIcon />}
                  size="small"
                  onClick={setPrevMonth}
                >
                  {t('Previous Month')}
                </Button>
                <Button
                  style={{ maxHeight: 35 }}
                  variant="contained"
                  endIcon={<ChevronRightIcon />}
                  size="small"
                  onClick={setNextMonth}
                  disabled={hasNext}
                >
                  {t('Next Month')}
                </Button>
              </>
            ) : null}
          </StyledTimeNavBox>
        </Container>
      </SimpleScreenOnly>
      <Box mt={2} mb={2}>
        <Container>
          <Divider></Divider>
        </Container>
      </Box>
      <SimpleScreenOnly>
        <Container sx={{ gap: 1, display: 'flex', flexDirection: 'row' }}>
          <DownloadButtonGroup
            transactions={
              selectedFundType
                ? [
                    ...(transactions[selectedFundType]?.income ?? []),
                    ...(transactions[selectedFundType]?.expenses ?? []),
                  ]
                : []
            }
          />
          <Box display={'flex'} flexGrow={1} justifyContent="flex-end" gap={1}>
            {isFilterDateSelected ? (
              <StyledFilterButton
                variant="outlined"
                startIcon={<FilterListOff />}
                size="small"
                onClick={() => {
                  setFilters(null);
                }}
              >
                {t('Clear Filters')}
              </StyledFilterButton>
            ) : null}
            <StyledFilterButton
              variant="outlined"
              startIcon={<Settings />}
              size="small"
              onClick={handleSettingsClick}
            >
              {t('Filter Settings')}
            </StyledFilterButton>
          </Box>
        </Container>
      </SimpleScreenOnly>
      <SimpleScreenOnly mt={2} mb={2}>
        <Container>
          <Divider />
        </Container>
      </SimpleScreenOnly>
      <Box>
        <SettingsDialog
          selectedFilters={filters || undefined}
          isOpen={isSettingsOpen}
          onClose={(newFilters) => {
            setFilters(newFilters ?? null);
            setIsSettingsOpen(false);
          }}
        />
        <SimpleScreenOnly mt={2}>
          <Container>
            {selectedFund && (
              <StaffReportTable
                transactions={getPosOrNegTransactions(
                  ReportType.Income,
                  selectedFund?.fundType,
                )}
                transferTotal={getFilteredTotals(
                  ReportType.Income,
                  selectedFund?.fundType,
                )}
                loading={loading}
                emptyPlaceholder={
                  <EmptyTable
                    title={t('No Income Transactions Found')}
                    subtitle={t('No data to display for this time period.')}
                    icon={LocalAtmIcon}
                  />
                }
                tableType={ReportType.Income}
              />
            )}
          </Container>
        </SimpleScreenOnly>
        <SimpleScreenOnly mt={2} mb={4}>
          <Container>
            {selectedFund && (
              <StaffReportTable
                transactions={getPosOrNegTransactions(
                  ReportType.Expense,
                  selectedFund?.fundType,
                )}
                transferTotal={getFilteredTotals(
                  ReportType.Expense,
                  selectedFund?.fundType,
                )}
                loading={loading}
                emptyPlaceholder={
                  <EmptyTable
                    title={t('No Expense Transactions Found')}
                    subtitle={t('No data to display for this time period.')}
                    icon={LocalAtmIcon}
                  />
                }
                tableType={ReportType.Expense}
              />
            )}
          </Container>
        </SimpleScreenOnly>
        <SimplePrintOnly mt={2}>
          {selectedFund && (
            <>
              <Typography variant="h6" mb={0} align="center">
                {t('Income')}
              </Typography>
              <PrintTables
                transactions={getPosOrNegTransactions(
                  ReportType.Income,
                  selectedFund?.fundType,
                )}
                transactionTotal={getFilteredTotals(
                  ReportType.Income,
                  selectedFund?.fundType,
                )}
                type={ReportType.Income}
              />
              <Typography variant="h6" mb={0} mt={2} align="center">
                {t('Expenses')}
              </Typography>
              <PrintTables
                transactions={getPosOrNegTransactions(
                  ReportType.Expense,
                  selectedFund?.fundType,
                )}
                transactionTotal={getFilteredTotals(
                  ReportType.Expense,
                  selectedFund?.fundType,
                )}
                type={ReportType.Expense}
              />
            </>
          )}
        </SimplePrintOnly>
      </Box>
    </Box>
  );
};
