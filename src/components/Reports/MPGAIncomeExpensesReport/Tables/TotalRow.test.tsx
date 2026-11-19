import { render, within } from '@testing-library/react';
import { MPGAIncomeExpensesReportTestWrapper } from '../MPGAIncomeExpensesReportTestWrapper';
import { mockData, months } from '../mockData';
import { TotalRow } from './TotalRow';

const mutationSpy = jest.fn();

const data = {
  income: [{ ...mockData.income[0] }, { ...mockData.income[1] }],
  expenses: [{ ...mockData.income[2] }],
};
const overallTotal = 108_856;

// Width of a bold 11px "NN,NNN.NN" in the app font (Source Sans Pro 700 with
// the body2 letter spacing), measured in headless Chromium. Digits in this font
// all have the same width, so every 5-digit total with cents needs this much.
// jsdom cannot measure text, so the tests check the room a cell leaves for it.
const boldFiveDigitTotalWidth = 48.33;

const px = (value: string) => parseFloat(value) || 0;

const textRoom = (cell: HTMLElement) => {
  const { paddingLeft, paddingRight } = getComputedStyle(cell);
  return (
    px(cell.style.getPropertyValue('--width')) -
    px(paddingLeft) -
    px(paddingRight)
  );
};

const monthCells = (grid: HTMLElement) =>
  within(grid)
    .getAllByRole('gridcell')
    .filter((cell) =>
      cell.getAttribute('data-field')?.startsWith('monthlyValue_'),
    );

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

  describe('5-digit monthly totals', () => {
    // Two rows that add up to 12,345.67 in every month.
    const bigRows = [
      {
        ...mockData.income[0],
        id: 'big-1',
        monthly: months.map(() => 10_000.5),
      },
      {
        ...mockData.income[1],
        id: 'big-2',
        monthly: months.map(() => 2_345.17),
      },
    ];

    it('shows the full total with cents in every month', () => {
      const { getByRole } = render(
        <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
          <TotalRow data={bigRows} overallTotal={148_148.04} />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      const cells = monthCells(getByRole('grid'));
      expect(cells).toHaveLength(months.length);
      cells.forEach((cell) => {
        expect(cell).toHaveTextContent(/^12,345\.67$/);
      });
    });

    it('leaves room in each month cell for a bold 5-digit total with cents', () => {
      const { getByRole } = render(
        <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
          <TotalRow data={bigRows} overallTotal={148_148.04} />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      const cells = monthCells(getByRole('grid'));
      expect(cells).toHaveLength(months.length);
      cells.forEach((cell) => {
        expect(textRoom(cell)).toBeGreaterThanOrEqual(boldFiveDigitTotalWidth);
      });
    });
  });
});
