import React from 'react';
import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from 'src/components/Reports/SalaryCalculator/SalaryCalculatorTestWrapper';
import { SalaryCalculatorEditPage } from './index.page';

describe('SalaryCalculatorEditPage', () => {
  it('renders Saving indicator', async () => {
    const { findByText } = render(
      <SalaryCalculatorTestWrapper>
        <SalaryCalculatorEditPage />
      </SalaryCalculatorTestWrapper>,
    );

    expect(await findByText(/Last saved/)).toBeInTheDocument();
  });
});
