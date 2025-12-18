import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalaryCalculatorContent } from '../SalaryCalculator';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper onCall={mutationSpy}>
    <SalaryCalculatorContent />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCalculator', () => {
  it('renders main content based on selected section', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Effective Date' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(
      getByRole('heading', { name: 'Your Information' }),
    ).toBeInTheDocument();
  });

  it('loads HCM data', async () => {
    render(<TestComponent />);

    await waitFor(() => expect(mutationSpy).toHaveGraphqlOperation('Hcm'));
  });

  it('loads salary calculation', async () => {
    render(<TestComponent />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('SalaryCalculation'),
    );
  });
});
