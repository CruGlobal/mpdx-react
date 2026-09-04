import '../sharedRechartMock';
import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { useMPGAIncomeExpenses } from '../../MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';
import { MPGAIncomeExpensesReportTestWrapper } from '../../MPGAIncomeExpensesReportTestWrapper';
import { MonthlySummaryChart } from './MonthlySummaryChart';
import { useMonthlySummaryChartData } from './useMonthlySummaryChartData';

const mutationSpy = jest.fn();
const monthCount = 12;

const ChartWithData: React.FC = () => {
  const { dataLoading, currency } = useMPGAIncomeExpenses();
  const data = useMonthlySummaryChartData();

  return (
    <MonthlySummaryChart
      data={data}
      currency={currency}
      loading={dataLoading}
      aspect={1.35}
      width={100}
    />
  );
};

const TestComponent: React.FC = () => (
  <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
    <ChartWithData />
  </MPGAIncomeExpensesReportTestWrapper>
);

describe('MonthlySummaryChart', () => {
  it('renders the bar chart', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() =>
      expect(region.querySelector('svg.recharts-surface')).toBeTruthy(),
    );
  });

  it('renders income and expense bars for each month', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() => {
      const barShapes = region.querySelectorAll(
        '.recharts-bar-rectangle rect, .recharts-bar-rectangle path',
      );
      expect(barShapes.length).toBe(monthCount * 2);
    });
  });

  it('renders the net difference above each month', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() => {
      const netLabels = Array.from(
        region.querySelectorAll('.recharts-label-list text'),
      ).map((node) => node.textContent);

      expect(netLabels).toEqual([
        '$5,709.00',
        '$5,136.00',
        '$4,655.00',
        '$5,251.00',
        '$6,794.00',
        '$5,564.00',
        '$5,856.00',
        '$7,026.00',
        '$7,713.00',
        '$7,312.00',
        '$9,579.00',
        '$16,588.00',
      ]);
    });
  });

  it('renders legend with correct labels', async () => {
    const { findByRole } = render(<TestComponent />);

    const list = await findByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);

    expect(within(list).getByText('Income')).toBeInTheDocument();
    expect(within(list).getByText('Expenses')).toBeInTheDocument();
  });

  it('displays x-axis labels correctly', async () => {
    const { container } = render(<TestComponent />);

    await waitFor(() => {
      const ticks = Array.from(
        container.querySelectorAll(
          '.recharts-cartesian-axis .recharts-cartesian-axis-tick tspan',
        ),
      ).map((n) => n.textContent);
      expect(ticks).toEqual(
        expect.arrayContaining([
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
          'Jan',
          'Feb',
          'Mar',
        ]),
      );
    });
  });

  it('renders a spinner instead of the chart while loading', () => {
    const { getByTestId, queryByRole } = render(<TestComponent />);

    expect(getByTestId('loading-spinner')).toBeInTheDocument();
    expect(queryByRole('region')).not.toBeInTheDocument();
  });
});
