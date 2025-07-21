/* eslint-disable no-console */
import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';

interface StaffExpenseReportProps {
  accountListId: string;
  designationAccounts?: string[];
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const StaffExpenseReport: React.FC<StaffExpenseReportProps> = ({
  accountListId,
  //designationAccounts,
  isNavListOpen,
  onNavListToggle,
  title,
}) => {
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
            description: 'Monthly Salary - July',
            date: '2025-07-01',
            amount: 3000.0,
            category: 'Salary',
          },
          {
            description: 'Church Contribution - July',
            date: '2025-07-05',
            amount: 1000.0,
            category: 'Contribution',
          },
          {
            description: 'Office Supplies',
            date: '2025-07-10',
            amount: -200.0,
            category: 'Benefit',
          },
          {
            description: 'Travel Reimbursement',
            date: '2025-07-15',
            amount: -300.0,
            category: 'Benefit',
          },
          {
            description: 'Monthly Salary - August',
            date: '2025-08-01',
            amount: 3000.0,
            category: 'Salary',
          },
          {
            description: 'Conference Fees',
            date: '2025-08-03',
            amount: -1300.0,
            category: 'Benefit',
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
    </Box>
  );
};
