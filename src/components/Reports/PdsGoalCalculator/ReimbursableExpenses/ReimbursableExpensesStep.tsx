import React from 'react';
import { Divider } from '@mui/material';
import { AnnualReimbursableSection } from './AnnualReimbursableSection';
import { MonthlyReimbursableSection } from './MonthlyReimbursableSection';
import { TotalReimbursableSection } from './TotalReimbursableSection';

export const ReimbursableExpensesStep: React.FC = () => {
  return (
    <>
      <MonthlyReimbursableSection />
      <Divider sx={{ mx: -4, my: 4 }} />
      <AnnualReimbursableSection />
      <Divider sx={{ mx: -4, my: 4 }} />
      <TotalReimbursableSection />
      <Divider sx={{ mx: -4, my: 4 }} />
    </>
  );
};
