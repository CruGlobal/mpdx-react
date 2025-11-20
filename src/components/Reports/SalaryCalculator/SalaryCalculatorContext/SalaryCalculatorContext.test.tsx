import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalaryCalculatorContent } from '../SalaryCalculator';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <SalaryCalculatorContent />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCalculator', () => {
  it('renders main content based on selected section', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Effective Date' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(
      getByRole('heading', { name: 'Personal Information' }),
    ).toBeInTheDocument();
  });
});
