import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { SalaryInformationCard } from './SalaryInformationCard';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <SalaryInformationCard />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryInformationCard', () => {
  it('renders table with proper structure', () => {
    const { getByRole } = render(<TestComponent />);
    const table = getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('renders table headers', () => {
    const { getAllByRole } = render(<TestComponent />);
    const columnHeaders = getAllByRole('columnheader');
    expect(columnHeaders.length).toBeGreaterThan(0);
  });

  it('renders table rows for salary categories', () => {
    const { getAllByRole } = render(<TestComponent />);
    const rows = getAllByRole('row');

    expect(rows).toHaveLength(7);
  });

  it('renders the link for MHA category', () => {
    const { getAllByRole } = render(<TestComponent />);
    const links = getAllByRole('link');
    expect(links).toHaveLength(1);
  });

  it('renders card header with avatar', () => {
    const { container } = render(<TestComponent />);
    const avatar = container.querySelector('[class*="MuiAvatar"]');
    expect(avatar).toBeInTheDocument();
  });
});
