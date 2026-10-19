import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import theme from 'src/theme';
import { DateRange } from '../helpers';
import { AddressChangeSummary } from './AddressChangeSummary';

const TestComponent: React.FC<{ dateRange?: DateRange | null }> = ({
  dateRange = null,
}) => (
  <ThemeProvider theme={theme}>
    <AddressChangeSummary
      changeCount={6}
      partnerCount={5}
      automaticCount={4}
      dateRange={dateRange}
    />
  </ThemeProvider>
);

const startDate = DateTime.local(2025, 10, 14);
const endDate = DateTime.local(2026, 10, 14);

describe('AddressChangeSummary', () => {
  it('shows the change, partner, and automatic counts', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('6 address changes for 5 partners')).toBeInTheDocument();
    expect(getByText('4 were automatic')).toBeInTheDocument();
  });

  it.each([
    ['both dates', { startDate, endDate }, 'Oct 14, 2025 to Oct 14, 2026'],
    ['only a start date', { startDate, endDate: null }, 'Since Oct 14, 2025'],
    ['only an end date', { startDate: null, endDate }, 'Through Oct 14, 2026'],
  ])('shows the range with %s', (_, dateRange, text) => {
    const { getByText } = render(<TestComponent dateRange={dateRange} />);

    expect(getByText(text)).toBeInTheDocument();
  });

  it('hides the range when none is applied', () => {
    const { queryByText } = render(<TestComponent />);

    expect(queryByText(/Oct 14|Since|Through/)).not.toBeInTheDocument();
  });
});
