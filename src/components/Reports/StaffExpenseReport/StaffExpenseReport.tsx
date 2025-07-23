/* eslint-disable no-console */
import React, { useState } from 'react';
import { Groups, Savings, Wallet } from '@mui/icons-material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Button, Container, Divider, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useLocale } from 'src/hooks/useLocale';
import { BalanceCard } from './BalanceCard/BalanceCard';
import { EmptyReportTable } from './Tables/EmptyReportTable';
import { ExpensesTable } from './Tables/ExpensesTable';
import IncomeTable from './Tables/IncomeTable';
import { downloadCsv } from './downloadReport';

interface StaffExpenseReportProps {
  accountListId: string;
  designationAccounts?: string[];
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
  time: DateTime;
  setTime: (time: DateTime) => void;
}

export interface Transaction {
  description: string;
  date: string;
  amount: number;
  category: string;
}

export const StaffExpenseReport: React.FC<StaffExpenseReportProps> = ({
  accountListId,
  //designationAccounts,
  isNavListOpen,
  onNavListToggle,
  title,
  time,
  setTime,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  //const startDate = time.toISODate();
  //const endDate = time.plus({ months: 1 }).minus({ days: 1 }).toISODate();

  // need query

  // Temporary dummy data
  const mockData = {
    accountList: {
      designationAccounts: [
        {
          id: 'abc123',
          name: 'John Smith Ministry',
          accountNumber: '45678',
        },
        {
          id: 'def456',
          name: 'General Outreach Fund',
          accountNumber: '98765',
        },
      ],
      transactionReport: {
        startingBalance: 5000.0,
        endingBalance: 7200.0,
        transactions: [
          {
            description: 'Office Supplies',
            date: '2025-07-01',
            amount: -100.0,
            category: 'Benefit',
          },
          {
            description: 'Travel Reimbursement',
            date: '2025-07-02',
            amount: -150.0,
            category: 'Benefit',
          },
          {
            description: 'Conference Fees',
            date: '2025-07-03',
            amount: -200.0,
            category: 'Benefit',
          },
          {
            description: 'Team Lunch',
            date: '2025-07-04',
            amount: -90.0,
            category: 'Benefit',
          },
          {
            description: 'Printing Materials',
            date: '2025-07-05',
            amount: -60.0,
            category: 'Benefit',
          },
          {
            description: 'New Office Chair',
            date: '2025-07-06',
            amount: -300.0,
            category: 'Benefit',
          },
          {
            description: 'Promotional Items',
            date: '2025-07-07',
            amount: -85.0,
            category: 'Benefit',
          },
          {
            description: 'Event Supplies',
            date: '2025-07-08',
            amount: -220.0,
            category: 'Benefit',
          },
          {
            description: 'Decorations',
            date: '2025-07-09',
            amount: -70.0,
            category: 'Benefit',
          },
          {
            description: 'Training Snacks',
            date: '2025-07-10',
            amount: -40.0,
            category: 'Benefit',
          },
          {
            description: 'Fuel Reimbursement',
            date: '2025-07-11',
            amount: -110.0,
            category: 'Benefit',
          },
          {
            description: 'Mileage',
            date: '2025-07-12',
            amount: -130.0,
            category: 'Benefit',
          },
          {
            description: 'Lodging',
            date: '2025-07-13',
            amount: -500.0,
            category: 'Benefit',
          },
          {
            description: 'Volunteer Meals',
            date: '2025-07-14',
            amount: -145.0,
            category: 'Benefit',
          },
          {
            description: 'Postage',
            date: '2025-07-15',
            amount: -35.0,
            category: 'Benefit',
          },
          {
            description: 'Cleaning Services',
            date: '2025-07-16',
            amount: -95.0,
            category: 'Benefit',
          },
          {
            description: 'Tech Support',
            date: '2025-07-17',
            amount: -160.0,
            category: 'Benefit',
          },
          {
            description: 'Office Internet',
            date: '2025-07-18',
            amount: -125.0,
            category: 'Benefit',
          },
          {
            description: 'Electric Bill',
            date: '2025-07-19',
            amount: -210.0,
            category: 'Benefit',
          },
          {
            description: 'Electric Bill',
            date: '2025-06-19',
            amount: 210.0,
            category: 'Benefit',
          },
          {
            description: 'Water Bill',
            date: '2025-07-20',
            amount: -80.0,
            category: 'Benefit',
          },
          {
            description: 'Janitorial Supplies',
            date: '2025-07-21',
            amount: -55.0,
            category: 'Benefit',
          },
          {
            description: 'Backup Drive',
            date: '2025-07-22',
            amount: -250.0,
            category: 'Benefit',
          },
          {
            description: 'Paper Products',
            date: '2025-07-23',
            amount: -65.0,
            category: 'Benefit',
          },
          {
            description: 'Donation Envelopes',
            date: '2025-07-24',
            amount: -95.0,
            category: 'Benefit',
          },
          {
            description: 'Booth Rental',
            date: '2025-07-25',
            amount: -300.0,
            category: 'Benefit',
          },
          {
            description: 'Extra Expense Test',
            date: '2025-07-31',
            amount: -100.0,
            category: 'Contribution',
          },
          {
            description: 'Monthly Salary - July',
            date: '2025-07-26',
            amount: 3000.0,
            category: 'Salary',
          },
          {
            description: 'Monthly Salary - August',
            date: '2025-07-27',
            amount: 3100.0,
            category: 'Salary',
          },
          {
            description: 'Church Contribution - July',
            date: '2025-07-28',
            amount: 1200.0,
            category: 'Contribution',
          },
          {
            description: 'Church Contribution - August',
            date: '2025-07-29',
            amount: 1300.0,
            category: 'Contribution',
          },
          {
            description: 'Monthly Salary - September',
            date: '2025-07-30',
            amount: 3200.0,
            category: 'Salary',
          },
          {
            description: 'Monthly Salary - September',
            date: '2025-07-30',
            amount: 1000000.0,
            category: 'Salary',
          },
          {
            description: 'Monthly Salary - September',
            date: '2025-08-30',
            amount: 2.0,
            category: 'Salary',
          },
          {
            description: 'Monthly Salary - September',
            date: '2025-07-30',
            amount: 1.0,
            category: 'Salary',
          },
        ],
      },
    },
  };

  const timeTitle = time.toJSDate().toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const hasNext = time.hasSame(DateTime.now().startOf('month'), 'month');

  const setPrevMonth = () => {
    const prevTime = time.minus({ months: 1 });
    setTime(prevTime);

    setTransactions(
      mockData.accountList.transactionReport.transactions.filter((tx) => {
        const txDate = DateTime.fromISO(tx.date);
        return (
          txDate >= prevTime.startOf('month') &&
          txDate <= prevTime.endOf('month')
        );
      }),
    );
  };

  const setNextMonth = () => {
    const nextTime = time.plus({ months: 1 });
    setTime(nextTime);

    setTransactions(
      mockData.accountList.transactionReport.transactions.filter((tx) => {
        const txDate = DateTime.fromISO(tx.date);
        return (
          txDate >= nextTime.startOf('month') &&
          txDate <= nextTime.endOf('month')
        );
      }),
    );
  };

  const [transactions, setTransactions] = useState<Transaction[]>(
    mockData.accountList.transactionReport.transactions.filter((tx) => {
      const txDate = DateTime.fromISO(tx.date);
      return txDate >= time.startOf('month') && txDate <= time.endOf('month');
    }),
  );

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
              ) : null}
            </Box>
            <Box display="flex" flexDirection="row" gap={3} mb={2}>
              <Typography>{t('John Smith')}</Typography>
              <Typography>{t(accountListId)}</Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              gap={1}
              mt={2}
              mb={2}
            >
              <BalanceCard
                icon={Wallet}
                iconBgColor="#FF9800"
                title={t('Staff Account Balance')}
                transactions={transactions}
                startingBalance={
                  mockData.accountList.transactionReport.startingBalance
                }
                endingBalance={
                  mockData.accountList.transactionReport.endingBalance
                }
              />
              <BalanceCard
                icon={Groups}
                iconBgColor="#90CAF9"
                title={t('Staff Conference Savings Balance')}
                transactions={transactions}
                startingBalance={
                  mockData.accountList.transactionReport.startingBalance
                }
                endingBalance={
                  mockData.accountList.transactionReport.endingBalance
                }
              />
              <BalanceCard
                icon={Savings}
                iconBgColor="#588C87"
                title={t('Staff Savings Balance')}
                transactions={transactions}
                startingBalance={
                  mockData.accountList.transactionReport.startingBalance
                }
                endingBalance={
                  mockData.accountList.transactionReport.endingBalance
                }
              />
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
            {transactions.some((tx) => tx.amount > 0) ? (
              <IncomeTable transactions={transactions} />
            ) : (
              <EmptyReportTable title={t('No Income Transactions Found')} />
            )}
          </Container>
        </Box>
        <Box mt={2}>
          <Container>
            {transactions.some((tx) => tx.amount < 0) ? (
              <ExpensesTable
                transactions={transactions}
                designationAccounts={mockData.accountList.designationAccounts}
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
