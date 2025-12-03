import { render } from '@testing-library/react';
import { SalaryCalculator } from './SalaryCalculator';
import { SalaryCalculatorTestWrapper } from './SalaryCalculatorTestWrapper';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <SalaryCalculator />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCalculator', () => {
  it('renders correctly', async () => {
    const { findByRole } = render(<TestComponent />);
    expect(
      await findByRole('heading', { name: 'Form Steps' }),
    ).toBeInTheDocument();
  });
});
