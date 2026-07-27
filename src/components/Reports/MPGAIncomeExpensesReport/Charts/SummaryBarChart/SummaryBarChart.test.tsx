import '../sharedRechartMock';
import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { MPGAIncomeExpensesReportTestWrapper } from '../../MPGAIncomeExpensesReportTestWrapper';
import { SummaryBarChart } from './SummaryBarChart';

const mutationSpy = jest.fn();

const incomeTotal = 108_856;
const expensesTotal = 20_969;

const TestComponent: React.FC = () => (
  <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
    <SummaryBarChart aspect={1.35} width={100} />
  </MPGAIncomeExpensesReportTestWrapper>
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

  it('renders a spinner instead of the chart while loading', () => {
    const { getByTestId, queryByRole } = render(<TestComponent />);

    expect(getByTestId('loading-spinner')).toBeInTheDocument();
    expect(queryByRole('region')).not.toBeInTheDocument();
  });
});
