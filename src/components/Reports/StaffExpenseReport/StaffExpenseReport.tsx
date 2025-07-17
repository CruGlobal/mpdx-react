import React from 'react';
import { Box } from '@mui/material';
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
  designationAccounts,
  isNavListOpen,
  onNavListToggle,
  title,
}) => {
  // Temporary dummy data
  const data = {
    accountList: {
      monthlyGoal: 5000,
      totalPledges: 3500,
      currency: 'USD',
    },
    reportsDonationHistories: [
      {
        id: '1',
        date: '2024-06-01',
        amount: 1000,
        donor: 'John Doe',
      },
      {
        id: '2',
        date: '2024-06-10',
        amount: 1500,
        donor: 'Jane Smith',
      },
    ],
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
        <pre>
          {JSON.stringify(
            {
              accountListId,
              designationAccounts,
              data,
            },
            null,
            2,
          )}
        </pre>
      </Box>
    </Box>
  );
};
