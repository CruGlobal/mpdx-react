import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { monthWidth } from './TableCard';
import { TableCardHead } from './TableCardHead';

const mutationSpy = jest.fn();

const months = [
  'Apr 2024',
  'May 2024',
  'Jun 2024',
  'Jul 2024',
  'Aug 2024',
  'Sep 2024',
  'Oct 2024',
  'Nov 2024',
  'Dec 2024',
  'Jan 2025',
  'Feb 2025',
  'Mar 2025',
];

function monthCount(months: string[]) {
  return months.reduce((acc, month) => {
    const year = month.split(' ')[1];
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
const year = monthCount(months);

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <TableCardHead months={months} />
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('TableCardHead', () => {
  it('should render table headers', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('2024')).toBeInTheDocument();
    expect(getByText('2025')).toBeInTheDocument();
    expect(getByText('Summary')).toBeInTheDocument();
  });

  it('should get month count for each year', () => {
    const { container } = render(<TestComponent />);

    const y2024 = container.querySelector(
      'th[data-year="2024"]',
    ) as HTMLTableCellElement;
    const y2025 = container.querySelector(
      'th[data-year="2025"]',
    ) as HTMLTableCellElement;

    expect(Number(y2024.dataset.count)).toBe(year['2024']);
    expect(Number(y2025.dataset.count)).toBe(year['2025']);
  });

  it('should span months correctly', () => {
    const { getByText } = render(<TestComponent />);

    const cell2024 = (getByText('2024').closest(
      'th,td',
    ) as HTMLTableCellElement)!;
    const cell2025 = (getByText('2025').closest(
      'th,td',
    ) as HTMLTableCellElement)!;

    expect(Number(cell2024.dataset.width)).toBe(
      (monthWidth + 5) * year['2024'],
    );
    expect(Number(cell2025.dataset.width)).toBe(
      (monthWidth + 5) * year['2025'],
    );
  });

  it('should apply correct color to border', () => {
    const { container } = render(<TestComponent />);

    const color1 = '#05699B';
    const color2 = '#F08020';

    const cell2024 = container.querySelector('th[data-year="2024"]')!;
    const cell2025 = container.querySelector('th[data-year="2025"]')!;
    expect(cell2024.getAttribute('data-color')).toBe(color1);
    expect(cell2025.getAttribute('data-color')).toBe(color2);
  });
});
