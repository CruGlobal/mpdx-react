/* eslint-disable no-console */
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
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  BreakdownByMonth,
  Fund,
  SubCategory,
  TransactionCategory,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { BalanceCard } from './BalanceCard/BalanceCard';
import { DownloadButtonGroup } from './DownloadButtonGroup/DownloadButtonGroup';
import { useReportsStaffExpensesQuery } from './GetStaffExpense.generated';
import { Filters, SettingsDialog } from './SettingsDialog/SettingsDialog';
import { EmptyReportTable } from './Tables/EmptyReportTable';
import { ExpensesTable } from './Tables/ExpensesTable';
import IncomeTable from './Tables/IncomeTable';

export interface Transaction extends BreakdownByMonth {
  fundType: Fund['fundType'];
  category: TransactionCategory['category'];
  subcategory?: SubCategory['subCategory'];
}

interface StaffExpenseReportProps {
  accountId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
  time: DateTime;
  setTime: (time: DateTime) => void;
}

export const StaffExpenseReport: React.FC<StaffExpenseReportProps> = ({
  isNavListOpen,
  onNavListToggle,
  title,
  time,
  setTime,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filters, setFilters] = useState<Filters | null | undefined>(null);
  const [isFilterDateSelected, setIsFilterDateSelected] = useState(
    Boolean(
      filters &&
        (filters.startDate || filters.endDate || filters.selectedDateRange),
    ),
  );

  // temporary console log to check filters
  console.log(filters);

  const { data } = useReportsStaffExpensesQuery({
    variables: {
      accountId: '1000000001',
      startMonth: time.startOf('month').toISODate(),
      endMonth: time.endOf('month').toISODate(),
    },
  });

  const handlePrint = () => window.print();

  const timeTitle = time.toJSDate().toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const hasNext = time.hasSame(DateTime.now().startOf('month'), 'month');

  // get all funds from the report data
  const allFunds: Fund[] = data?.reportsStaffExpenses?.funds ?? [];

  // gets a default fund type - Primary
  const defaultFundType: Fund['fundType'] | null =
    allFunds.find((f) => f.fundType === 'Primary')?.fundType ??
    allFunds[0]?.fundType ??
    null;

  // store state of selected fund type
  const [selectedFundType, setSelectedFundType] = useState<
    Fund['fundType'] | null
  >(defaultFundType);

  // effect to set the default fund type if not already set
  useEffect(() => {
    if (!selectedFundType && allFunds.length > 0) {
      const defaultType =
        allFunds.find((f) => f.fundType === 'Primary')?.fundType ??
        allFunds[0]?.fundType ??
        null;

      if (defaultType) {
        setSelectedFundType(defaultType);
      }
    }
  }, [allFunds, selectedFundType]);

  // get selected fund based on the selected fund type
  const selectedFund = allFunds.find((f) => f.fundType === selectedFundType);

  // filter transactions based on fund and month
  const filterTransactionsByTime = (
    fund: Fund,
    targetTime: DateTime,
  ): Transaction[] => {
    return (
      fund.categories?.flatMap((category) =>
        category.subcategories
          ? category.subcategories.flatMap(
              (subcategory) =>
                subcategory.breakdownByMonth
                  ?.filter((tx) => {
                    const txDate = DateTime.fromISO(tx.month);
                    return (
                      txDate >= targetTime.startOf('month') &&
                      txDate <= targetTime.endOf('month')
                    );
                  })
                  .map((tx) => ({
                    ...tx,
                    fundType: fund.fundType,
                    category: `${category.category} - ${subcategory.subCategory}`,
                  })) ?? [],
            )
          : category.breakdownByMonth
              ?.filter((tx) => {
                const txDate = DateTime.fromISO(tx.month);
                return (
                  txDate >= targetTime.startOf('month') &&
                  txDate <= targetTime.endOf('month')
                );
              })
              .map((tx) => ({
                ...tx,
                fundType: fund.fundType,
                category: category.category,
              })) ?? [],
      ) ?? []
    );
  };

  const setPrevMonth = () => {
    const prevTime = time.minus({ months: 1 });
    setTime(prevTime);

    const newTransactions: Record<Fund['fundType'], Transaction[]> = {};

    allFunds.forEach((fund) => {
      const txs = filterTransactionsByTime(fund, prevTime);
      newTransactions[fund.fundType] = txs;
    });

    setTransactions(newTransactions);
  };

  const setNextMonth = () => {
    const nextTime = time.plus({ months: 1 });
    setTime(nextTime);

    const newTransactions: Record<Fund['fundType'], Transaction[]> = {};

    allFunds.forEach((fund) => {
      const txs = filterTransactionsByTime(fund, nextTime);
      newTransactions[fund.fundType] = txs;
    });

    setTransactions(newTransactions);
  };

  const [transactions, setTransactions] = useState<
    Record<Fund['fundType'], Transaction[]>
  >({});

  // update transactions when fund or time changes
  useEffect(() => {
    if (allFunds.length === 0) {
      return;
    }

    const newTransactions: Record<Fund['fundType'], Transaction[]> = {};

    allFunds.forEach((fund) => {
      const fundTransactions = filterTransactionsByTime(fund, time);
      newTransactions[fund.fundType] = fundTransactions;
    });

    setTransactions(newTransactions);
  }, [allFunds, time]);

  const handleCardClick = (fundType: Fund['fundType']) => {
    setSelectedFundType(fundType);
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
    setIsSettingsOpen(!isSettingsOpen);
  };

  // filter transactions for each table in selected fund
  const getPosOrNegTransactions = (
    direction: string,
    fundType: Fund['fundType'],
  ) => {
    const txs = transactions[fundType] ?? [];
    return txs.filter((tx) =>
      direction === 'positive' ? tx.total > 0 : tx.total < 0,
    );
  };

  // get totals for expenses and income tables
  const getFilteredTotals = (direction: string, fundType: Fund['fundType']) => {
    const filtered = getPosOrNegTransactions(direction, fundType);
    return filtered.reduce((sum, tx) => sum + tx.total, 0);
  };

  // get totals for transfers in and out
  const transferTotals = useMemo(() => {
    const totals: Record<Fund['fundType'], { in: number; out: number }> = {};

    for (const [fundType, txs] of Object.entries(transactions)) {
      totals[fundType as Fund['fundType']] = {
        in: txs
          .filter((tx) => tx.total > 0)
          .reduce((sum, tx) => sum + tx.total, 0),
        out: txs
          .filter((tx) => tx.total < 0)
          .reduce((sum, tx) => sum + tx.total, 0),
      };
    }

    return totals;
  }, [transactions]);

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={title}
        headerType={HeaderTypeEnum.Report}
      />
      <Box mt={2}>
        <Container>
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h4">{t('Income and Expenses')}</Typography>
              {transactions && Object.keys(transactions).length > 0 ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                  gap={1}
                >
                  <Button
                    startIcon={
                      <SvgIcon fontSize="small">
                        <PrintIcon titleAccess={t('Print')} />
                      </SvgIcon>
                    }
                    onClick={handlePrint}
                    sx={{
                      border: '1px solid',
                      borderRadius: 1,
                      ml: 2,
                      px: 2,
                      py: 1,
                    }}
                  >
                    {t('Print')}
                  </Button>
                </Box>
              ) : null}
            </Box>
            <Box display="flex" flexDirection="row" gap={3} mb={2}>
              <Typography>
                {t(data?.reportsStaffExpenses.name ?? '')}
              </Typography>
              <Typography>
                {t(data?.reportsStaffExpenses.accountId ?? '')}
              </Typography>
            </Box>
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              sx={{
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              {allFunds.map((fund) => (
                <BalanceCard
                  key={fund.fundType}
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
                  startingBalance={data?.reportsStaffExpenses.startBalance ?? 0}
                  endingBalance={data?.reportsStaffExpenses.endBalance ?? 0}
                  transfersIn={transferTotals[fund.fundType]?.in ?? 0}
                  transfersOut={transferTotals[fund.fundType]?.out ?? 0}
                  onClick={handleCardClick}
                />
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
      <Box mt={2} mb={2}>
        <Container>
          <Divider></Divider>
        </Container>
      </Box>
      <Box mt={2}>
        <Container>
          <Box
            sx={{
              display: 'flex',
              margin: 0,
              gap: 2,
            }}
          >
            {!filters && <Typography variant="h6">{timeTitle}</Typography>}
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
          </Box>
        </Container>
      </Box>
      {!isFilterDateSelected && (
        <Box mt={2} mb={2}>
          <Container>
            <Divider></Divider>
          </Container>
        </Box>
      )}
      <Box>
        <Container sx={{ gap: 1, display: 'flex', flexDirection: 'row' }}>
          <DownloadButtonGroup
            transactions={transactions[selectedFundType ?? ''] ?? []}
          />
          <Box display={'flex'} flexGrow={1} justifyContent="flex-end" gap={1}>
            {isFilterDateSelected ? (
              <Button
                variant="outlined"
                startIcon={<FilterListOff />}
                size="small"
                onClick={() => {
                  setFilters(null);
                  setIsFilterDateSelected(false);
                }}
                sx={{
                  backgroundColor: 'white',
                  color: 'black',
                  borderColor: 'black',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: 'black',
                  },
                }}
              >
                {t('Clear Filters')}
              </Button>
            ) : null}
            <Button
              variant="outlined"
              startIcon={<Settings />}
              size="small"
              sx={{
                backgroundColor: 'white',
                color: 'black',
                borderColor: 'black',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: 'black',
                },
              }}
              onClick={handleSettingsClick}
            >
              {t('Filter Settings')}
            </Button>
          </Box>
        </Container>
      </Box>
      <Box mt={2} mb={2}>
        <Container>
          <Divider></Divider>
        </Container>
      </Box>
      <Box>
        <SettingsDialog
          selectedFilters={filters || undefined}
          isOpen={isSettingsOpen}
          onClose={(filters) => {
            setFilters(filters);
            setIsSettingsOpen(false);
            setIsFilterDateSelected(
              Boolean(
                filters &&
                  (filters.startDate ||
                    filters.endDate ||
                    filters.selectedDateRange),
              ),
            );
          }}
        />
        <Box mt={2}>
          <Container>
            {selectedFund &&
            transactions[selectedFund.fundType]?.some((tx) => tx.total > 0) ? (
              <IncomeTable
                transactions={getPosOrNegTransactions(
                  'positive',
                  selectedFund?.fundType,
                )}
                transfersIn={getFilteredTotals(
                  'positive',
                  selectedFund?.fundType,
                )}
              />
            ) : (
              <EmptyReportTable title={t('No Income Transactions Found')} />
            )}
          </Container>
        </Box>
        <Box mt={2} mb={4}>
          <Container>
            {selectedFund &&
            transactions[selectedFund.fundType]?.some((tx) => tx.total < 0) ? (
              <ExpensesTable
                transactions={getPosOrNegTransactions(
                  'negative',
                  selectedFund?.fundType,
                )}
                transfersOut={getFilteredTotals(
                  'negative',
                  selectedFund?.fundType,
                )}
              />
            ) : (
              <EmptyReportTable title={t('No Expense Transactions Found')} />
            )}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};
