/* eslint-disable no-console */
import React from 'react';
import { Box } from '@mui/material';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useStaffExpenseReportQuery } from './GetStaffExpense.generated';

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
  const { data } = useStaffExpenseReportQuery({
    variables: {
      accountId: '1000000001',
      fundTypes:
        designationAccounts && designationAccounts.length > 0
          ? designationAccounts
          : [],
    },
    onError: (error) => {
      console.log('Full error object:', error);
      console.log('GraphQL errors:', error.graphQLErrors);
      error.graphQLErrors?.forEach((gqlError, index) => {
        console.log(`GraphQL Error ${index}:`, {
          message: gqlError.message,
          extensions: gqlError.extensions,
          locations: gqlError.locations,
          path: gqlError.path,
        });
      });
    },
  });

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
