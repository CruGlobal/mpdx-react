import { render, within } from '@testing-library/react';
import { MPGAIncomeExpensesReportTestWrapper } from '../MPGAIncomeExpensesReportTestWrapper';
import { mockData } from '../mockData';
import { TotalRow } from './TotalRow';

const mutationSpy = jest.fn();

const data = {
  income: [{ ...mockData.income[0] }, { ...mockData.income[1] }],
  expenses: [{ ...mockData.income[2] }],
};
const overallTotal = 108_856;

describe('TotalRow', () => {
  it('renders correctly', () => {
    const { getByRole, getByText } = render(
      <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
        <TotalRow data={data.income} overallTotal={overallTotal} />
      </MPGAIncomeExpensesReportTestWrapper>,
    );

    expect(getByRole('grid')).toBeInTheDocument();
    expect(getByText('Overall Total')).toBeInTheDocument();
    expect(getByRole('gridcell', { name: '108,856' })).toBeInTheDocument();
  });

  it('should display - when no data available', () => {
    const { getByRole } = render(
      <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
        <TotalRow data={data.expenses} overallTotal={0} />
      </MPGAIncomeExpensesReportTestWrapper>,
    );

    const grid = getByRole('grid');
    expect(within(grid).getAllByText('-')).toHaveLength(14);
  });
});
