import { render } from '@testing-library/react';
import { LandingTestWrapper } from '../Landing/NewSalaryCalculationLanding/LandingTestWrapper';
import { SalaryInformationCard } from './SalaryInformationCard';

const TestComponent: React.FC = () => (
  <LandingTestWrapper>
    <SalaryInformationCard />
  </LandingTestWrapper>
);

describe('SalaryInformationCard', () => {
  it('renders table with proper structure', () => {
    const { getByRole } = render(<TestComponent />);
    const table = getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('renders card title', () => {
    const { getByRole } = render(<TestComponent />);
    expect(
      getByRole('heading', { name: 'Current Salary Information' }),
    ).toBeInTheDocument();
  });

  it('renders last updated date', async () => {
    const { findByTestId } = render(<TestComponent />);
    expect(await findByTestId('last-updated')).toBeInTheDocument();
  });

  it('renders category column headers', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);
    expect(getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'John' }),
    ).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Jane' }),
    ).toBeInTheDocument();
  });

  it('renders salary category names', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('cell', { name: 'Maximum Allowable Salary' }),
    ).toBeInTheDocument();
    expect(
      getByRole('cell', { name: 'Tax-deferred 403(b) Contribution' }),
    ).toBeInTheDocument();
    expect(
      getByRole('cell', { name: 'Roth 403(b) Contribution' }),
    ).toBeInTheDocument();
    expect(
      getByRole('cell', { name: 'Security (SECA/FICA) Status' }),
    ).toBeInTheDocument();
    expect(
      getByRole('cell', { name: 'Gross Requested Salary' }),
    ).toBeInTheDocument();
    expect(
      getByRole('cell', { name: 'Current MHA (Included in Gross Salary)' }),
    ).toBeInTheDocument();
  });

  it('renders table rows for salary categories', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(await findByRole('cell', { name: '5%' })).toBeInTheDocument();
    expect(await findByRole('cell', { name: '12%' })).toBeInTheDocument();

    expect(await findByRole('cell', { name: '10%' })).toBeInTheDocument();
    expect(await findByRole('cell', { name: '6%' })).toBeInTheDocument();
  });

  it('renders the View link for MHA category', () => {
    const { getByRole } = render(<TestComponent />);
    const link = getByRole('link', { name: 'View' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('/reports/housingAllowance'),
    );
  });

  it('renders card header with avatar', () => {
    const { container } = render(<TestComponent />);
    expect(container.querySelector('.MuiAvatar-root')).toBeInTheDocument();
  });
});
