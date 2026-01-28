import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { DiscardButton, StepNavigation, SubmitButton } from './StepNavigation';

const mutationSpy = jest.fn();

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

describe('DiscardButton', () => {
  it('opens discard dialog on click and calls delete mutation', async () => {
    const { findByText } = render(
      <SalaryCalculatorTestWrapper onCall={mutationSpy}>
        <DiscardButton />
      </SalaryCalculatorTestWrapper>,
    );
    userEvent.click(await findByText('Discard'));

    userEvent.click(await findByText('Yes, Discard'));
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteSalaryCalculation', {
        input: { id: 'salary-request-1' },
      }),
    );
  });
});

describe('SubmitButton', () => {
  it('submits calculation', async () => {
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
