import React from 'react';
import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from 'src/components/Reports/SalaryCalculator/SalaryCalculatorTestWrapper';
import SalaryCalculatorPage from './index.page';

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
});
