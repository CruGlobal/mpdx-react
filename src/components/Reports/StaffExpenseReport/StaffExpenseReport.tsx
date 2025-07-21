/* eslint-disable no-console */
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
  const mockData = {
    accountList: {
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
        <pre>
          {JSON.stringify(
            {
              accountListId,
              designationAccounts,
              mockData,
            },
            null,
            2,
          )}
        </pre>
      </Box>
    </Box>
  );
};

// export const StaffExpenseReport: React.FC<StaffExpenseReportProps> = ({
//   accountListId,
//   designationAccounts,
//   isNavListOpen,
//   onNavListToggle,
//   title,
// }) => {
//   const { data, loading, error } = useStaffExpenseReportQuery({
//     variables: {
//       accountId: '1000000001',
//       fundTypes:
//         designationAccounts && designationAccounts.length > 0
//           ? designationAccounts
//           : [],
//     },
//     onError: (error) => {
//       console.log('Full error object:', error);
//       console.log('GraphQL errors:', error.graphQLErrors);
//       error.graphQLErrors?.forEach((gqlError, index) => {
//         console.log(`GraphQL Error ${index}:`, {
//           message: gqlError.message,
//           extensions: gqlError.extensions,
//           locations: gqlError.locations,
//           path: gqlError.path,
//         });
//       });
//     },
//   });

//   return (
//     <Box>
//       <MultiPageHeader
//         isNavListOpen={isNavListOpen}
//         onNavListToggle={onNavListToggle}
//         title={title}
//         headerType={HeaderTypeEnum.Report}
//       />
//       <Box mt={2}>
//         <Container>
//           <Box>
//             <Typography variant="h4">Income and Expenses</Typography>
//             <Box display="flex" flexDirection="row" gap={2}>
//               <Typography>{data?.reportsStaffExpenses.name}</Typography>
//               <Typography>Account ID: {accountListId}</Typography>
//             </Box>
//           </Box>
//           {/* <Typography>
//             Designation Accounts: {designationAccounts?.join(', ')}
//           </Typography>
//           <pre>{JSON.stringify(data, null, 2)}</pre> */}
//         </Container>
//       </Box>
//     </Box>
//   );
// };
