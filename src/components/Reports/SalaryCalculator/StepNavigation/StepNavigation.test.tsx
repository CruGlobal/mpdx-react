import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { StepNavigation } from './StepNavigation';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <StepNavigation onBack={() => {}} onContinue={() => {}} />
  </SalaryCalculatorTestWrapper>
);

describe('StepNavigation', () => {
  it('renders back and continue buttons', async () => {
    const { getByText, findByText } = render(<TestComponent />);
    expect(await findByText('Back')).toBeInTheDocument();
    expect(getByText('Continue')).toBeInTheDocument();
  });
});
