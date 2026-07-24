import '../sharedRechartMock';
import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { MPGAIncomeExpensesReportTestWrapper } from '../../MPGAIncomeExpensesReportTestWrapper';
import { ExpensesPieChart } from './ExpensesPieChart';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
    <ExpensesPieChart aspect={1.35} width={100} />
  </MPGAIncomeExpensesReportTestWrapper>
);

describe('ExpensesPieChart', () => {
  it('render pie chart', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() =>
      expect(region.querySelector('svg.recharts-surface')).toBeTruthy(),
    );
  });

  it('renders six slices', async () => {
    const { findByRole } = render(<TestComponent />);
    const region = await findByRole('region');

    await waitFor(() => {
      const sectors = region.querySelectorAll('.recharts-pie-sector path');
      expect(sectors.length).toBe(6);
    });
  });

  it('shows legend items', async () => {
    const { findByRole } = render(<TestComponent />);

    const list = await findByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(6);
  });

  it('shows the legend labels', async () => {
    const { getByText, findByText } = render(<TestComponent />);

    expect(await findByText('Ministry')).toBeInTheDocument();
    expect(getByText('Healthcare')).toBeInTheDocument();
    expect(getByText('Assessment')).toBeInTheDocument();
    expect(getByText('Benefits')).toBeInTheDocument();
    expect(getByText('Salary')).toBeInTheDocument();
    expect(getByText('Other')).toBeInTheDocument();
  });

  it('shows a percentage label for each non-empty slice', async () => {
    const { findByText, getByText, queryByText } = render(<TestComponent />);

    expect(await findByText('66%')).toBeInTheDocument();
    expect(getByText('11%')).toBeInTheDocument();
    expect(getByText('10%')).toBeInTheDocument();
    expect(getByText('9%')).toBeInTheDocument();
    expect(getByText('3%')).toBeInTheDocument();

    // Salary is only 0.12% of expenses, so its label rounds away.
    expect(queryByText('0%')).not.toBeInTheDocument();
  });

  it('shows a message when there is no data', async () => {
    const { findByText } = render(
      <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy} isEmpty>
        <ExpensesPieChart aspect={1.35} width={100} />
      </MPGAIncomeExpensesReportTestWrapper>,
    );

    expect(
      await findByText('You have no data at this time.'),
    ).toBeInTheDocument();
  });

  it('renders a spinner instead of the chart while loading', () => {
    const { getByTestId, queryByRole, queryByText } = render(<TestComponent />);

    expect(getByTestId('loading-spinner')).toBeInTheDocument();
    expect(queryByRole('region')).not.toBeInTheDocument();

    expect(
      queryByText('You have no data at this time.'),
    ).not.toBeInTheDocument();
  });
});
