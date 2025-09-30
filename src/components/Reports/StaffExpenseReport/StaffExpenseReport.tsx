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
  BreakdownByMonth,
  Fund,
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import theme from 'src/theme';
import { useStaffAccountQuery } from '../StaffAccount.generated';
import { AccountInfoBox } from './AccountInfoBox/AccountInfoBox';
import { AccountInfoBoxSkeleton } from './AccountInfoBox/AccountInfoBoxSkeleton';
import { BalanceCard } from './BalanceCard/BalanceCard';
import { BalanceCardSkeleton } from './BalanceCard/BalanceCardSkeleton';
import { CategoryBreakdownDialog } from './CategoryBreakdownDialog/CategoryBreakdownDialog';
import { DownloadButtonGroup } from './DownloadButtonGroup/DownloadButtonGroup';
import { useReportsStaffExpensesQuery } from './GetStaffExpense.generated';
import { TableType } from './Helpers/StaffReportEnum';
import {
  dateRangeToString,
  getFormattedDateString,
} from './Helpers/formatDate';
import { Filters, SettingsDialog } from './SettingsDialog/SettingsDialog';
import { EmptyReportTable } from './Tables/EmptyReportTable';
import { PrintTables } from './Tables/PrintTables';
import { StaffReportTable } from './Tables/StaffReportTable';
import { filterTransactions } from './filterTransactions';

const ScreenOnly = styled(Box)({
  '@media print': {
    display: 'none',
  },
});

const PrintOnly = styled(Box)({
  display: 'none',
  '@media print': {
    display: 'block',
  },
});

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

export interface Transaction extends BreakdownByMonth {
  fundType: string;
  category: StaffExpenseCategoryEnum;
  subcategory?: StaffExpensesSubCategoryEnum;
  displayCategory: string;
  subTransactions?: Transaction[];
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
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

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

  const allFunds: Fund[] = data?.reportsStaffExpenses?.funds ?? [];

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
  }, [allFunds, selectedFundType, defaultFundType]);

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
      const incomeTransactions = filterTransactions(
        fund,
        time,
        t,
        filters,
        'income',
      );
      const expenseTransactions = filterTransactions(
        fund,
        time,
        t,
        filters,
        'expenses',
      );

      newTransactions[fund.fundType] = {
        income: incomeTransactions,
        expenses: expenseTransactions,
      };
    });

    return newTransactions;
  }, [allFunds, time, t, filters]);

  const categoryFilterOptions = useMemo(() => {
    const categories: StaffExpenseCategoryEnum[] = [];

    allFunds.forEach((fund) => {
      fund.categories?.forEach((category) => {
        if (!categories.includes(category.category)) {
          categories.push(category.category);
        }
      });
    });

    return categories;
  }, [allFunds]);

  const handleCardClick = (fundType: string) => {
    setSelectedFundType(fundType);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const getPosOrNegTransactions = (tableType: TableType, fundType: string) => {
    const fundTransactions = transactions[fundType];
    if (!fundTransactions) {
      return [];
    }

    return tableType === TableType.Income
      ? fundTransactions.income
      : fundTransactions.expenses;
  };

  const getFilteredTotals = (tableType: TableType, fundType: string) => {
    const filtered = getPosOrNegTransactions(tableType, fundType);
    return filtered.reduce((sum, transaction) => sum + transaction.total, 0);
  };

  const transferTotals = useMemo(() => {
    const totals: Record<string, { in: number; out: number }> = {};

    for (const [fundType, fundTransactions] of Object.entries(transactions)) {
      totals[fundType] = {
        in: fundTransactions.income.reduce(
          (sum, transaction) => sum + transaction.total,
          0,
        ),
        out: fundTransactions.expenses.reduce(
          (sum, transaction) => sum + transaction.total,
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
      <ScreenOnly>
        <MultiPageHeader
          isNavListOpen={isNavListOpen}
          onNavListToggle={onNavListToggle}
          title={title}
          headerType={HeaderTypeEnum.Report}
        />
      </ScreenOnly>
      <Box mt={2}>
        <Container>
          <Box>
            <StyledHeaderBox>
              <PrintOnly>
                <Typography variant="h4">
                  {t('Income and Expenses: {{timeTitle}}', {
                    timeTitle: timeTitle,
                  })}
                </Typography>
              </PrintOnly>
              <ScreenOnly>
                <Typography variant="h4">{t('Income and Expenses')}</Typography>
              </ScreenOnly>
              {Object.values(transactions).some(
                (fundTransactions) =>
                  fundTransactions.income.length ||
                  fundTransactions.expenses.length,
              ) ? (
                <ScreenOnly
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
                </ScreenOnly>
              ) : null}
            </StyledHeaderBox>
            {loading ? (
              <AccountInfoBoxSkeleton />
            ) : (
              <AccountInfoBox name={name} accountId={id} />
            )}
            <ScreenOnly>
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
                            ? '#FF9800'
                            : fund.fundType === 'Savings'
                            ? '#90CAF9'
                            : '#588C87'
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
            </ScreenOnly>
            <PrintOnly>
              <Box>
                {selectedFundType && (
                  <>
                    <Typography variant="h6" mb={0}>
                      {t('{{fundType}}', {
                        fundType: selectedFundType,
                      }).toUpperCase()}
                    </Typography>
                    <Typography>
                      {t('Starting Balance: ${{balance}}', {
                        balance: data?.reportsStaffExpenses.startBalance
                          ? data.reportsStaffExpenses.startBalance.toLocaleString(
                              locale,
                            )
                          : '0',
                      })}
                    </Typography>
                    <Typography>
                      {t('+ Transfers in: ${{transfersIn}}', {
                        transfersIn:
                          transferTotals[selectedFundType]?.in.toLocaleString(
                            locale,
                          ) ?? '0',
                      })}
                    </Typography>
                    <Typography>
                      {t('- Transfers out: ${{transfersOut}}', {
                        transfersOut:
                          Math.abs(
                            transferTotals[selectedFundType]?.out,
                          ).toLocaleString(locale) ?? '0',
                      })}
                    </Typography>
                    <Typography>
                      {t('Ending Balance: ${{balance}}', {
                        balance: data?.reportsStaffExpenses.endBalance
                          ? data.reportsStaffExpenses.endBalance.toLocaleString(
                              locale,
                            )
                          : '0',
                      })}
                    </Typography>
                  </>
                )}
              </Box>
            </PrintOnly>
          </Box>
        </Container>
      </Box>
      <ScreenOnly mt={2} mb={2}>
        <Container>
          <Divider />
        </Container>
      </ScreenOnly>
      <ScreenOnly mt={2}>
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
      </ScreenOnly>
      <Box mt={2} mb={2}>
        <Container>
          <Divider></Divider>
        </Container>
      </Box>
      <ScreenOnly>
        <Container sx={{ gap: 1, display: 'flex', flexDirection: 'row' }}>
          <DownloadButtonGroup
            transactions={[
              ...(transactions[selectedFundType ?? '']?.income ?? []),
              ...(transactions[selectedFundType ?? '']?.expenses ?? []),
            ]}
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
      </ScreenOnly>
      <ScreenOnly mt={2} mb={2}>
        <Container>
          <Divider />
        </Container>
      </ScreenOnly>
      <Box>
        <SettingsDialog
          selectedFilters={filters || undefined}
          isOpen={isSettingsOpen}
          onClose={(newFilters) => {
            setFilters(newFilters ?? null);
            setIsSettingsOpen(false);
          }}
          categoryFilterOptions={categoryFilterOptions}
        />
        <ScreenOnly mt={2}>
          <Container>
            {selectedFund && (
              <StaffReportTable
                transactions={getPosOrNegTransactions(
                  TableType.Income,
                  selectedFund?.fundType,
                )}
                transferTotal={getFilteredTotals(
                  TableType.Income,
                  selectedFund?.fundType,
                )}
                loading={loading}
                emptyPlaceholder={
                  <EmptyReportTable title={t('No Income Transactions Found')} />
                }
                tableType={TableType.Income}
                onTransactionSelect={setSelectedTransaction}
              />
            )}
          </Container>
        </ScreenOnly>
        <ScreenOnly mt={2} mb={4}>
          <Container>
            {selectedFund && (
              <StaffReportTable
                transactions={getPosOrNegTransactions(
                  TableType.Expenses,
                  selectedFund?.fundType,
                )}
                transferTotal={getFilteredTotals(
                  TableType.Expenses,
                  selectedFund?.fundType,
                )}
                loading={loading}
                emptyPlaceholder={
                  <EmptyReportTable
                    title={t('No Expense Transactions Found')}
                  />
                }
                tableType={TableType.Expenses}
                onTransactionSelect={setSelectedTransaction}
              />
            )}
          </Container>
        </ScreenOnly>
        <PrintOnly mt={2}>
          {selectedFund && (
            <>
              <Typography variant="h6" mb={0} align="center">
                {t('Income')}
              </Typography>
              <PrintTables
                transactions={getPosOrNegTransactions(
                  TableType.Income,
                  selectedFund?.fundType,
                )}
                transactionTotal={getFilteredTotals(
                  TableType.Income,
                  selectedFund?.fundType,
                )}
                type={TableType.Income}
              />
              <Typography variant="h6" mb={0} mt={2} align="center">
                {t('Expenses')}
              </Typography>
              <PrintTables
                transactions={getPosOrNegTransactions(
                  TableType.Expenses,
                  selectedFund?.fundType,
                )}
                transactionTotal={getFilteredTotals(
                  TableType.Expenses,
                  selectedFund?.fundType,
                )}
                type={TableType.Expenses}
              />
            </>
          )}
        </PrintOnly>
      </Box>
      <CategoryBreakdownDialog
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </Box>
  );
};
