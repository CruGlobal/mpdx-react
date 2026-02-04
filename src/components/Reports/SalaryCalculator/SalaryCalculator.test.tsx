import { render, waitFor } from '@testing-library/react';
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
