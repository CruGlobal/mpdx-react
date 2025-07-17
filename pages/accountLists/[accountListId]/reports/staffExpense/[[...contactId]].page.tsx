import React from 'react';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';

const StaffExpenseReportPage: React.FC = () => {
  return (
    <div>
      <h1>Staff Expense Report</h1>
    </div>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;
export default StaffExpenseReportPage;
