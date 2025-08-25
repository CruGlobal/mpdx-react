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
import { ExpensesPieChart } from './ExpensesPieChart';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <TotalsProvider data={mockData}>
          <ExpensesPieChart aspect={1.35} width={100} />
        </TotalsProvider>
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
