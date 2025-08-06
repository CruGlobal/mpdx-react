import React from 'react';
import { GoalCalculatorGrid } from '../../../SharedComponents/GoalCalculatorGrid/GoalCalculatorGrid';

export const SpecialIncomeStep: React.FC = () => {
  return (
    <GoalCalculatorGrid
      promptText="Do you have any sources of income other than contributions?"
      headerName="Special Income Name"
      ctaText="Add Special Income"
    />
  );
};
