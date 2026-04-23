import React from 'react';
import { OtherSection } from './OtherSection';
import { SalarySection } from './SalarySection';

export const SupportItemStep: React.FC = () => {
  return (
    <>
      <SalarySection />
      <OtherSection />
    </>
  );
};
