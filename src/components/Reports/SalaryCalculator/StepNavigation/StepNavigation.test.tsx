import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { CancelButton, StepNavigation, SubmitButton } from './StepNavigation';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <StepNavigation />
  </SalaryCalculatorTestWrapper>
);

describe('StepNavigation', () => {
  it('renders back and continue buttons', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Back')).toBeInTheDocument();
    expect(getByText('Continue')).toBeInTheDocument();
  });
});

describe('DeleteButton', () => {
  it('opens cancel dialog on click', async () => {
    const { findByText } = render(
      <SalaryCalculatorTestWrapper onCall={mutationSpy}>
        <CancelButton />
      </SalaryCalculatorTestWrapper>,
    );
    userEvent.click(await findByText('Cancel'));

    userEvent.click(await findByText('Yes, Cancel'));
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
