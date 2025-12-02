import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../../SalaryCalculatorTestWrapper';
import { NewSalaryCalculatorLanding } from './NewSalaryCalculatorLanding';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <NewSalaryCalculatorLanding />
  </SalaryCalculatorTestWrapper>
);

describe('NewSalaryCalculatorLanding', () => {
  it('renders main heading', async () => {
    const { findByRole } = render(<TestComponent />);
    expect(
      await findByRole('heading', { name: 'Salary Calculation Form' }),
    ).toBeInTheDocument();
  });

  it('renders SalaryOverviewCard component', async () => {
    const { findByRole } = render(<TestComponent />);
    expect(
      await findByRole('heading', { name: 'Doe, John' }),
    ).toBeInTheDocument();
  });

  it('renders SalaryInformationCard with table', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(await findByRole('table')).toBeInTheDocument();
  });

  it('renders action button', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('button', { name: 'Continue Salary Calculation' }),
    ).toBeInTheDocument();
  });
});
