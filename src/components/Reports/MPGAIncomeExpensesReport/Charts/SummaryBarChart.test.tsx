import './sharedRechartMock';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { mockData } from '../mockData';
import { SummaryBarChart } from './SummaryBarChart';

const mutationSpy = jest.fn();

const mockIncome = [
  { ...mockData.income.data[0] },
  { ...mockData.income.data[1] },
];

const expenseData = [
  { ...mockData.ministryExpenses.data[0] },
  { ...mockData.ministryExpenses.data[1] },
  { ...mockData.healthcareExpenses.data[0] },
  { ...mockData.misc.data[0] },
  { ...mockData.misc.data[1] },
  { ...mockData.other.data[0] },
];

const incomeTotal = mockIncome.reduce((acc, curr) => acc + curr.total, 0);
const expensesTotal = expenseData.reduce((acc, curr) => acc + curr.total, 0);

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <SummaryBarChart
          incomeTotal={incomeTotal}
          expensesTotal={expensesTotal}
          aspect={1.35}
          width={100}
        />
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
