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
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
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
import theme from 'src/theme';
import { BalanceCard } from './BalanceCard/BalanceCard';
import { DownloadButtonGroup } from './DownloadButtonGroup/DownloadButtonGroup';
import { useReportsStaffExpensesQuery } from './GetStaffExpense.generated';
import { TableType } from './Helpers/StaffReportEnum';
import { Filters, SettingsDialog } from './SettingsDialog/SettingsDialog';
import { EmptyReportTable } from './Tables/EmptyReportTable';
import { PrintTables } from './Tables/PrintTables';
import { StaffReportTable } from './Tables/StaffReportTable';
import { filterTransactions } from './filterTransactions';

export interface Transaction extends BreakdownByMonth {
  fundType: string;
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

const ScreenOnly = styled(Box)(() => ({
  '@media print': {
    display: 'none',
  },
}));

const PrintOnly = styled(Box)(() => ({
  display: 'none',
  '@media print': {
    display: 'block',
  },
}));

export const StaffExpenseReport: React.FC<StaffExpenseReportProps> = ({
  isNavListOpen,
  onNavListToggle,
  title,
  time,
  setTime,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filters, setFilters] = useState<Filters | null | undefined>(null);
  const [isFilterDateSelected, setIsFilterDateSelected] = useState(
    Boolean(
      filters &&
        (filters.startDate || filters.endDate || filters.selectedDateRange),
    ),
  );
  const [filterTimeTitle, setFilterTimeTitle] = useState<string | null>(null);

  const { data, loading } = useReportsStaffExpensesQuery({
    variables: {
      accountId: '1000000001',
      startMonth: filters?.startDate
        ? filters.startDate.startOf('month').toISODate()
        : time.startOf('month').toISODate(),
      endMonth: filters?.endDate
        ? filters.endDate.endOf('month').toISODate()
        : time.endOf('month').toISODate(),
    },
  });
  console.log(data);
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
    if (!selectedFundType && allFunds.length > 0) {
      const defaultType =
        allFunds.find((fund) => fund.fundType === 'Primary')?.fundType ??
        allFunds[0]?.fundType;
      setSelectedFundType(defaultType);
    }
  }, [allFunds, selectedFundType]);

  const selectedFund = allFunds.find((f) => f.fundType === selectedFundType);

  const setPrevMonth = () => {
    const prevTime = time.minus({ months: 1 });
    setTime(prevTime);

    const newTransactions: Record<string, Transaction[]> = {};

    allFunds.forEach((fund) => {
      const txs = filterTransactions(fund, prevTime, filters);
      newTransactions[fund.fundType] = txs;
    });

    setTransactions(newTransactions);
  };

  const setNextMonth = () => {
    const nextTime = time.plus({ months: 1 });
    setTime(nextTime);

    const newTransactions: Record<string, Transaction[]> = {};

    allFunds.forEach((fund) => {
      const txs = filterTransactions(fund, nextTime, filters);
      newTransactions[fund.fundType] = txs;
    });

    setTransactions(newTransactions);
  };

  const [transactions, setTransactions] = useState<
    Record<string, Transaction[]>
  >({});

  useEffect(() => {
    if (allFunds.length === 0) {
      return;
    }

    const newTransactions: Record<string, Transaction[]> = {};

    allFunds.forEach((fund) => {
      const fundTransactions = filterTransactions(fund, time, filters);
      newTransactions[fund.fundType] = fundTransactions;
    });

    setTransactions(newTransactions);
  }, [allFunds, time, filters]);

  const handleCardClick = (fundType: string) => {
    setSelectedFundType(fundType);
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
    setIsSettingsOpen(!isSettingsOpen);
  };

  const getPosOrNegTransactions = (tableType: TableType, fundType: string) => {
    const txs = transactions[fundType] ?? [];
    return txs.filter((tx) =>
      tableType === TableType.Income ? tx.total > 0 : tx.total < 0,
    );
  };

  const getFilteredTotals = (tableType: TableType, fundType: string) => {
    const filtered = getPosOrNegTransactions(tableType, fundType);
    return filtered.reduce((sum, tx) => sum + tx.total, 0);
  };

  const transferTotals = useMemo(() => {
    const totals: Record<string, { in: number; out: number }> = {};

    for (const [fundType, txs] of Object.entries(transactions)) {
      totals[fundType] = {
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

  const changeFilterTimeTitle = (newFilters: Filters | undefined) => {
    let newFilterTimeTitle: string | null = null;
    if (newFilters?.selectedDateRange) {
      newFilterTimeTitle = t('Date Range: {{range}}', {
        range: newFilters.selectedDateRange,
      });
    } else if (newFilters?.startDate && newFilters?.endDate) {
      newFilterTimeTitle = t('{{start}} - {{end}}', {
        start: newFilters.startDate.toJSDate().toLocaleDateString(locale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        end: newFilters.endDate.toJSDate().toLocaleDateString(locale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      });
    } else if (newFilters?.startDate && !newFilters?.endDate) {
      newFilterTimeTitle = t('{{start}} - Current Date', {
        start: newFilters.startDate.toJSDate().toLocaleDateString(locale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      });
    } else if (!newFilters?.startDate && newFilters?.endDate) {
      newFilterTimeTitle = t('{{start}} - {{end}}', {
        start: DateTime.now()
          .startOf('month')
          .toJSDate()
          .toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        end: newFilters.endDate.toJSDate().toLocaleDateString(locale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      });
    }

    setFilterTimeTitle(newFilterTimeTitle);
  };

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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                justifyContent: 'space-between',
              }}
            >
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
              {Object.values(transactions).some((txs) => txs.length > 0) ? (
                <ScreenOnly
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
                </ScreenOnly>
              ) : null}
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              gap={3}
              mb={2}
              data-testid="account-info"
            >
              <Typography>
                {t(data?.reportsStaffExpenses.name ?? '')}
              </Typography>
              <Typography>
                {t(data?.reportsStaffExpenses.accountId ?? '')}
              </Typography>
            </Box>
            <ScreenOnly>
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
                    startingBalance={
                      data?.reportsStaffExpenses.startBalance ?? 0
                    }
                    endingBalance={data?.reportsStaffExpenses.endBalance ?? 0}
                    transfersIn={transferTotals[fund.fundType]?.in ?? 0}
                    transfersOut={transferTotals[fund.fundType]?.out ?? 0}
                    onClick={handleCardClick}
                  />
                ))}
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
          <Divider></Divider>
        </Container>
      </ScreenOnly>
      <ScreenOnly mt={2}>
        <Container>
          <Box
            sx={{
              display: 'flex',
              margin: 0,
              gap: 2,
            }}
          >
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
          </Box>
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
            transactions={transactions[selectedFundType ?? ''] ?? []}
            enqueueSnackbar={enqueueSnackbar}
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
                  color: theme.palette.cruGrayDark.main,
                  borderColor: theme.palette.cruGrayDark.main,
                  '&:hover': {
                    backgroundColor: theme.palette.cruGrayLight.main,
                    borderColor: theme.palette.cruGrayDark.main,
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
                color: theme.palette.cruGrayDark.main,
                borderColor: theme.palette.cruGrayDark.main,
                '&:hover': {
                  backgroundColor: theme.palette.cruGrayLight.main,
                  borderColor: theme.palette.cruGrayDark.main,
                },
              }}
              onClick={handleSettingsClick}
            >
              {t('Filter Settings')}
            </Button>
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
            setFilters(newFilters);
            setIsSettingsOpen(false);
            setIsFilterDateSelected(
              Boolean(
                newFilters &&
                  (newFilters.startDate ||
                    newFilters.endDate ||
                    newFilters.selectedDateRange),
              ),
            );
            changeFilterTimeTitle(newFilters);
          }}
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
    </Box>
  );
};
