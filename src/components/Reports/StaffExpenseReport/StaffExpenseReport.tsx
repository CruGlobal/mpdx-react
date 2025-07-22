/* eslint-disable no-console */
import React from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Button, Container, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useLocale } from 'src/hooks/useLocale';
import { ExpensesTable } from './Tables/ExpensesTable';

interface StaffExpenseReportProps {
  accountListId: string;
  designationAccounts?: string[];
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
  time: DateTime;
  setTime: (time: DateTime) => void;
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

  const timeTitle = time.toJSDate().toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const hasNext = time.hasSame(DateTime.now().startOf('month'), 'month');

  const setPrevMonth = () => {
    setTime(time.minus({ months: 1 }));
  };

  const setNextMonth = () => {
    setTime(time.plus({ months: 1 }));
  };

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
            category: 'Benefit',
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
        ],
      },
    },
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
            <Typography variant="h4">Income and Expenses</Typography>
            <Box display="flex" flexDirection="row" gap={3} mb={2}>
              <Typography>John Smith</Typography>
              <Typography>{accountListId}</Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>
                <strong>Starting Balance: </strong>$
                {mockData.accountList.transactionReport.startingBalance}
              </Typography>
              <Typography>
                <strong>Ending Balance: </strong>$
                {mockData.accountList.transactionReport.endingBalance}
              </Typography>
            </Box>
          </Box>
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
              onClick={() => setPrevMonth()}
            >
              {t('Previous Month')}
            </Button>
            <Button
              style={{ maxHeight: 35 }}
              variant="contained"
              endIcon={<ChevronRightIcon />}
              size="small"
              onClick={() => setNextMonth()}
              disabled={hasNext}
            >
              {t('Next Month')}
            </Button>
          </Box>
        </Container>
      </Box>
      <Box mt={2}>
        <Container>
          <ExpensesTable
            transactions={mockData.accountList.transactionReport.transactions}
            designationAccounts={mockData.accountList.designationAccounts}
          />
        </Container>
      </Box>
    </Box>
  );
};
