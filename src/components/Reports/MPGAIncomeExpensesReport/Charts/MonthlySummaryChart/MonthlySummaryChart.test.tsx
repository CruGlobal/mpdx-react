import '../sharedRechartMock';
import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { MPGAIncomeExpensesReportTestWrapper } from '../../MPGAIncomeExpensesReportTestWrapper';
import { MonthlySummaryChart } from './MonthlySummaryChart';

const mutationSpy = jest.fn();
const monthCount = 12;

const TestComponent: React.FC = () => (
  <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
    <MonthlySummaryChart aspect={1.35} width={100} />
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
        '$5,709',
        '$5,136',
        '$4,655',
        '$5,251',
        '$6,794',
        '$5,564',
        '$5,856',
        '$7,026',
        '$7,713',
        '$7,312',
        '$9,579',
        '$16,588',
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
