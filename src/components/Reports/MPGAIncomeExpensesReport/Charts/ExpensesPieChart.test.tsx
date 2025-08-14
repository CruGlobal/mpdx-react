import './sharedRechartMock';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { mockData } from '../mockData';
import { ExpensesPieChart } from './ExpensesPieChart';

const mutationSpy = jest.fn();

const data = {
  accountListId: '12345',
  accountName: 'Test Account',
  ministryExpenses: [
    { ...mockData.ministryExpenses.data[0] },
    { ...mockData.ministryExpenses.data[1] },
  ],
  healthcareExpenses: [{ ...mockData.healthcareExpenses.data[0] }],
  misc: [{ ...mockData.misc.data[0] }, { ...mockData.misc.data[1] }],
  other: [{ ...mockData.other.data[0] }],
};

const ministryTotal = data.ministryExpenses.reduce(
  (acc, item) => acc + item.total,
  0,
);
const healthcareTotal = data.healthcareExpenses.reduce(
  (acc, item) => acc + item.total,
  0,
);
const miscTotal = data.misc.reduce((acc, item) => acc + item.total, 0);
const otherTotal = data.other.reduce((acc, item) => acc + item.total, 0);

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <ExpensesPieChart
          ministryExpenses={ministryTotal}
          healthcareExpenses={healthcareTotal}
          misc={miscTotal}
          other={otherTotal}
          aspect={1.35}
          width={100}
        />
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('ExpensesPieChart', () => {
  it('render pie chart', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() =>
      expect(region.querySelector('svg.recharts-surface')).toBeTruthy(),
    );
  });

  it('renders four slices', async () => {
    const { findByRole } = render(<TestComponent />);
    const region = await findByRole('region');

    await waitFor(() => {
      const sectors = region.querySelectorAll('.recharts-pie-sector path');
      expect(sectors.length).toBe(4);
    });
  });

  it('shows legend items', async () => {
    const { findByRole } = render(<TestComponent />);

    const list = await findByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(4);
  });

  it('shows the legend labels', async () => {
    const { getByText, findByText } = render(<TestComponent />);

    expect(await findByText('Ministry')).toBeInTheDocument();
    expect(getByText('Healthcare')).toBeInTheDocument();
    expect(getByText('Miscellaneous')).toBeInTheDocument();
    expect(getByText('Assessment, Benefits, Salary')).toBeInTheDocument();
  });
});
