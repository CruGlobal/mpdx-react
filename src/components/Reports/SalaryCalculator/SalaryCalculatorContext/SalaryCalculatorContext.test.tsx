import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalaryCalculator } from '../SalaryCalculator';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';

describe('SalaryCalculator', () => {
  it('renders main content based on selected section', () => {
    const { getByRole } = render(
      <SalaryCalculatorTestWrapper>
        <SalaryCalculator />
      </SalaryCalculatorTestWrapper>,
    );

    expect(
      getByRole('heading', { name: '1. Effective Date' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(
      getByRole('heading', { name: '2. Personal Information' }),
    ).toBeInTheDocument();
  });
});
