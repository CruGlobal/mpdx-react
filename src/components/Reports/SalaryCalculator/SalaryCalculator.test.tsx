import { render } from '@testing-library/react';
import { SalaryCalculator } from './SalaryCalculator';
import { SalaryCalculatorTestWrapper } from './SalaryCalculatorTestWrapper';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <SalaryCalculator />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCalculator', () => {
  it('renders without crashing', () => {
    const { getAllByRole } = render(<TestComponent />);
    // Should render at least one heading (main step label)
    expect(getAllByRole('heading').length).toBeGreaterThan(0);
  });
});
