/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { Groups, Savings, Wallet } from '@mui/icons-material';
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
import { useReportsStaffExpensesQuery } from './GetStaffExpense.generated';
import { EmptyReportTable } from './Tables/EmptyReportTable';
import { ExpensesTable } from './Tables/ExpensesTable';
import IncomeTable from './Tables/IncomeTable';
import { downloadCsv } from './downloadReport';

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

  // filter transactions based on the selected fund and month
  const filterTransactionsByTime = (targetTime: DateTime): Transaction[] => {
    if (!selectedFund) {
      return [];
    }

    return (
      selectedFund.categories?.flatMap((category) =>
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
                    fundType: selectedFund.fundType,
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
                fundType: selectedFund.fundType,
                category: category.category,
              })) ?? [],
      ) ?? []
    );
  };

  const setPrevMonth = () => {
    const prevTime = time.minus({ months: 1 });
    setTime(prevTime);
    setTransactions(filterTransactionsByTime(prevTime));
  };

  const setNextMonth = () => {
    const nextTime = time.plus({ months: 1 });
    setTime(nextTime);
    setTransactions(filterTransactionsByTime(nextTime));
  };

  // Filter transactions based on the selected fund and time
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // update transactions when the selected fund or time changes
  useEffect(() => {
    if (selectedFund) {
      setTransactions(filterTransactionsByTime(time));
    }
  }, [selectedFund, time]);

  const handleCardClick = (fundType: Fund['fundType']) => {
    setSelectedFundType(fundType);
  };

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
              {transactions && transactions.length > 0 ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                  gap={1}
                >
                  <Button
                    variant="text"
                    size="small"
                    sx={{
                      textDecoration: 'underline',
                      minWidth: 'unset',
                      px: 0,
                      py: 1,
                    }}
                    onClick={() => downloadCsv(transactions, 'full')}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                      {t('Download Full Report')}
                    </Typography>
                  </Button>
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
            <Box display="flex" flexWrap="wrap" gap={2}>
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
                  transactions={transactions}
                  isSelected={selectedFundType === fund.fundType}
                  startingBalance={data?.reportsStaffExpenses.startBalance ?? 0}
                  endingBalance={data?.reportsStaffExpenses.endBalance ?? 0}
                  onClick={handleCardClick}
                />
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
      <Box mt={3} mb={3}>
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
            <Typography variant="h6">{timeTitle}</Typography>
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
          </Box>
        </Container>
      </Box>
      <Box>
        <Box mt={2}>
          <Container>
            {transactions.some((tx) => tx.total > 0) ? (
              <IncomeTable transactions={transactions} />
            ) : (
              <EmptyReportTable title={t('No Income Transactions Found')} />
            )}
          </Container>
        </Box>
        <Box mt={2} mb={4}>
          <Container>
            {transactions.some((tx) => tx.total < 0) ? (
              <ExpensesTable transactions={transactions} />
            ) : (
              <EmptyReportTable title={t('No Expense Transactions Found')} />
            )}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};
