import React from 'react';
import { render } from '@testing-library/react';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SalaryCalculatorTestWrapper } from 'src/components/Reports/SalaryCalculator/SalaryCalculatorTestWrapper';
import SalaryCalculatorPage, { getServerSideProps } from './index.page';

const TestComponent = () => (
  <SalaryCalculatorTestWrapper>
    <SalaryCalculatorPage />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCalculatorPage', () => {
  it('renders the Salary Calculator header', () => {
    const { getByRole } = render(<TestComponent />);
    expect(
      getByRole('heading', { name: /Salary Calculator/i }),
    ).toBeInTheDocument();
  });

  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });
});
