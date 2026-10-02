import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalaryCalculator } from './SalaryCalculator';
import { SalaryCalculatorTestWrapper } from './SalaryCalculatorTestWrapper';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <SalaryCalculator />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCalculator', () => {
  describe('edit mode', () => {
    it('renders sidebar open with Form Steps heading', async () => {
      const { findByRole } = render(<TestComponent />);
      expect(
        await findByRole('heading', { name: 'Form Steps' }),
      ).toBeInTheDocument();
    });

    it('renders toggle menu icon', async () => {
      const { findByLabelText } = render(<TestComponent />);
      expect(await findByLabelText('Toggle Menu')).toBeInTheDocument();
    });
  });

  describe('when HCM is unavailable', () => {
    it('shows the heavy load alert instead of the step', async () => {
      const { findByRole, getByRole, queryByRole } = render(
        <SalaryCalculatorTestWrapper hcmUnavailableCalls={Infinity}>
          <SalaryCalculator />
        </SalaryCalculatorTestWrapper>,
      );

      expect(await findByRole('alert')).toHaveTextContent(
        'The system is currently under heavy load. Please try again in a few minutes.',
      );
      expect(
        queryByRole('button', { name: 'Continue' }),
      ).not.toBeInTheDocument();
      expect(getByRole('heading', { name: 'Form Steps' })).toBeInTheDocument();
    });

    it('shows the step when Try Again succeeds', async () => {
      const { findByRole, queryByText } = render(
        <SalaryCalculatorTestWrapper hcmUnavailableCalls={1}>
          <SalaryCalculator />
        </SalaryCalculatorTestWrapper>,
      );

      const alert = await findByRole('alert');
      userEvent.click(within(alert).getByRole('button', { name: 'Try Again' }));

      expect(
        await findByRole('button', { name: 'Continue' }),
      ).toBeInTheDocument();
      // The effective date step has its own banner alert, so look for the heavy load text
      expect(
        queryByText(/The system is currently under heavy load/),
      ).not.toBeInTheDocument();
    });
  });

  describe('view mode', () => {
    it('renders sidebar closed', async () => {
      const { queryByRole, findByLabelText } = render(
        <SalaryCalculatorTestWrapper editing={false}>
          <SalaryCalculator />
        </SalaryCalculatorTestWrapper>,
      );

      await waitFor(() =>
        expect(queryByRole('progressbar')).not.toBeInTheDocument(),
      );

      const sidebar = await findByLabelText('Salary Calculator Sections');
      expect(sidebar).toHaveAttribute('aria-expanded', 'false');
    });

    it('does not render toggle menu icon', async () => {
      const { queryByRole, queryByLabelText } = render(
        <SalaryCalculatorTestWrapper editing={false}>
          <SalaryCalculator />
        </SalaryCalculatorTestWrapper>,
      );

      await waitFor(() =>
        expect(queryByRole('progressbar')).not.toBeInTheDocument(),
      );

      expect(queryByLabelText('Toggle Menu')).not.toBeInTheDocument();
    });
  });
});
