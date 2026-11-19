import '../sharedRechartMock';
import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { useMPGAIncomeExpenses } from '../../MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';
import { MPGAIncomeExpensesReportTestWrapper } from '../../MPGAIncomeExpensesReportTestWrapper';
import {
  MonthlySummaryAverages,
  MonthlySummaryChart,
} from './MonthlySummaryChart';
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

const ChartWithNoDataLabel: React.FC = () => (
  <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
    <MonthlySummaryChart
      data={[
        { month: 'Jan 2023', income: 0, expenses: 0, net: 0 },
        { month: 'Feb 2023', income: 0, expenses: 0, net: 0 },
      ]}
      currency="USD"
      aspect={1.35}
      width={100}
      noDataLabel="N/A"
    />
  </MPGAIncomeExpensesReportTestWrapper>
);

const averagesData = [
  { month: 'Jan 2023', income: 4000, expenses: 3500, net: 500 },
  { month: 'Feb 2023', income: 3600, expenses: 3900, net: -300 },
];

const ChartWithAverages: React.FC<{
  noDataLabel?: string;
  averages?: MonthlySummaryAverages;
}> = ({ noDataLabel, averages = { income: 3800, expenses: 3700 } }) => (
  <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
    <MonthlySummaryChart
      data={averagesData}
      currency="USD"
      aspect={1.35}
      width={100}
      overrideIncomeText="Contributions"
      averages={averages}
      noDataLabel={noDataLabel}
    />
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

  it('hides the net labels and the currency axis when given a noDataLabel', async () => {
    const { findByRole } = render(<ChartWithNoDataLabel />);

    const region = await findByRole('region');

    await waitFor(() =>
      expect(region.querySelector('svg.recharts-surface')).toBeTruthy(),
    );
    expect(region.querySelectorAll('.recharts-label-list text')).toHaveLength(
      0,
    );
    expect(within(region).queryByText(/^\$/)).not.toBeInTheDocument();
  });

  it('lists each average with its amount in the legend', async () => {
    const { findByRole } = render(<ChartWithAverages />);

    const list = await findByRole('list');

    expect(
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual([
      'Contributions',
      'Expenses',
      'Contributions average: $3,800.00',
      'Expenses average: $3,700.00',
    ]);
  });

  it('puts the legend above the chart when it lists averages', async () => {
    const { findByRole } = render(<ChartWithAverages />);

    const list = await findByRole('list');

    expect(list.closest('.recharts-wrapper')).toBeNull();
  });

  it('draws an unlabelled dashed line for each average', async () => {
    const { findByRole } = render(<ChartWithAverages />);

    const region = await findByRole('region');

    await waitFor(() =>
      expect(
        region.querySelectorAll('.recharts-reference-line line'),
      ).toHaveLength(2),
    );
    region
      .querySelectorAll('.recharts-reference-line line')
      .forEach((line) =>
        expect(line).toHaveAttribute('stroke-dasharray', '6 4'),
      );
    expect(
      region.querySelectorAll('.recharts-reference-line text'),
    ).toHaveLength(0);
  });

  it('shows a lone $0 average in the legend and as a line', async () => {
    const { findByRole } = render(
      <ChartWithAverages averages={{ expenses: 0 }} />,
    );

    const list = await findByRole('list');

    expect(
      within(list).getByText('Expenses average: $0.00'),
    ).toBeInTheDocument();
    expect(
      within(list).queryByText(/Contributions average/),
    ).not.toBeInTheDocument();
    expect(
      (await findByRole('region')).querySelectorAll('.recharts-reference-line'),
    ).toHaveLength(1);
  });

  it('draws no average lines without averages', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() =>
      expect(region.querySelector('svg.recharts-surface')).toBeTruthy(),
    );
    expect(region.querySelectorAll('.recharts-reference-line')).toHaveLength(0);
  });

  it('draws no average lines when amounts are masked', async () => {
    const { findByRole } = render(<ChartWithAverages noDataLabel="N/A" />);

    const region = await findByRole('region');

    await waitFor(() =>
      expect(region.querySelector('svg.recharts-surface')).toBeTruthy(),
    );
    expect(region.querySelectorAll('.recharts-reference-line')).toHaveLength(0);
    expect(within(region).queryByText(/average/)).not.toBeInTheDocument();
  });

  it('renders legend with correct labels', async () => {
    const { findByRole } = render(<TestComponent />);

    const list = await findByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(list.closest('.recharts-legend-wrapper')).toBeInTheDocument();

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
