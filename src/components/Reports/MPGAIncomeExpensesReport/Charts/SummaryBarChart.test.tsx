import './sharedRechartMock';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { TotalsProvider } from '../TotalsContext/TotalsContext';
import { mockData } from '../mockData';
import { SummaryBarChart } from './SummaryBarChart';

const mutationSpy = jest.fn();
const currency = 'USD';

const incomeTotal = 108_856;
const expensesTotal = 18_569;

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <TotalsProvider data={mockData}>
          <SummaryBarChart aspect={1.35} width={100} currency={currency} />
        </TotalsProvider>
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('SummaryBarChart', () => {
  it('renders the bar chart', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() =>
      expect(region.querySelector('svg.recharts-surface')).toBeTruthy(),
    );
  });

  it('renders income and expenses bar', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() => {
      const barShapes = region.querySelectorAll(
        '.recharts-bar-rectangle rect, .recharts-bar-rectangle path',
      );
      expect(barShapes.length).toBe(2);
    });
  });

  it('renders the correct totals', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');
    const format = (n: number) =>
      n.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      });

    await waitFor(async () => {
      expect(
        await within(region).findByText(format(incomeTotal)),
      ).toBeInTheDocument();
      expect(
        await within(region).findByText(format(expensesTotal)),
      ).toBeInTheDocument();
    });
  });
});
