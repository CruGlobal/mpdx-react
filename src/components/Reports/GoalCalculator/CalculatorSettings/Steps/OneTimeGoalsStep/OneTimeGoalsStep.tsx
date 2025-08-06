import React from 'react';
import { GoalCalculatorGrid } from '../../../SharedComponents/GoalCalculatorGrid/GoalCalculatorGrid';

export const OneTimeGoalsStep: React.FC = () => {
  return (
    <GoalCalculatorGrid
      headerName="One-Time Goal Name"
      ctaText="Add One-Time Goal"
    />
  );
};
