import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { StepNavigation, SubmitButton } from './StepNavigation';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <StepNavigation />
  </SalaryCalculatorTestWrapper>
);

describe('StepNavigation', () => {
  it('renders back and continue buttons', async () => {
    const { getByText, findByText } = render(<TestComponent />);
    expect(await findByText('Back')).toBeInTheDocument();
    expect(getByText('Continue')).toBeInTheDocument();
  });
});

describe('SubmitButton', () => {
  it('submits calculation', async () => {
    const mutationSpy = jest.fn();
    const { findByText } = render(
      <SalaryCalculatorTestWrapper onCall={mutationSpy}>
        <SubmitButton />
      </SalaryCalculatorTestWrapper>,
    );

    userEvent.click(await findByText('Submit'));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('SubmitSalaryCalculation', {
        input: { id: 'salary-request-1' },
      }),
    );
  });
});
