import { render } from '@testing-library/react';
import { SalaryCalculator } from './SalaryCalculator';
import { SalaryCalculatorTestWrapper } from './SalaryCalculatorTestWrapper';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <SalaryCalculator />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCalculator', () => {
  it('renders without crashing', async () => {
    const { findAllByRole } = render(<TestComponent />);
    // Should render at least one heading (main step label)
    expect((await findAllByRole('heading')).length).toBeGreaterThan(0);
  });
});
