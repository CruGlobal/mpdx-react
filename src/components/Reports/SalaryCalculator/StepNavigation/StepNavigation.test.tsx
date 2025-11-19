import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { StepNavigation } from './StepNavigation';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <StepNavigation
      onCancel={() => {}}
      onBack={() => {}}
      onContinue={() => {}}
    />
  </SalaryCalculatorTestWrapper>
);

describe('StepNavigation', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('Back')).toBeInTheDocument();
    expect(getByText('Continue')).toBeInTheDocument();
  });
});
