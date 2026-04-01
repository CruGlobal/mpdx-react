import { render, waitFor } from '@testing-library/react';
import { LandingTestWrapper } from '../Landing/NewSalaryCalculationLanding/LandingTestWrapper';
import { SalaryInformationCard } from './SalaryInformationCard';

const TestComponent: React.FC = () => (
  <LandingTestWrapper hasApprovedCalculation>
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
    const { getAllByRole } = render(<TestComponent />);

    await waitFor(() =>
      expect(
        getAllByRole('columnheader').map((cell) => cell.textContent),
      ).toEqual(['Category', 'John', 'Jane']),
    );
  });

  it('renders salary category names', async () => {
    const { getAllByRole } = render(<TestComponent />);

    const expectedCells = [
      ['Maximum Allowable Salary', '$60,000.00', '$70,000.00'],
      ['Requested Salary', '$50,000.00', '$60,000.00'],
      ['Tax-deferred 403(b) Contribution', '5%', '6%'],
      ['Roth 403(b) Contribution', '12%', '10%'],
      ['Security (SECA/FICA) Status', 'Subject to SECA', 'Subject to SECA'],
      ['Gross Salary', '$55,000.00', '$10,000.00'],
      [
        'Current MHA (Included in Gross Salary)',
        '$10,000.00View MHA Form',
        '$12,000.00',
      ],
    ].flat();

    await waitFor(() =>
      expect(getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
        expectedCells,
      ),
    );
  });

  it('renders the View link for MHA category', () => {
    const { getByRole } = render(<TestComponent />);
    expect(getByRole('link', { name: 'View MHA Form' })).toHaveAttribute(
      'href',
      expect.stringContaining('/reports/housingAllowance'),
    );
  });

  it('renders card header with avatar', () => {
    const { container } = render(<TestComponent />);
    expect(container.querySelector('.MuiAvatar-root')).toBeInTheDocument();
  });
});
