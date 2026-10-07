import React from 'react';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { MPGAIncomeExpensesReportTestWrapper } from '../MPGAIncomeExpensesReportTestWrapper';
import { DataFields, mockData, months } from '../mockData';
import { PrintTables } from './PrintTables';

const mutationSpy = jest.fn();

const title = 'Income';

const TestComponent: React.FC = () => (
  <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
    <PrintTables
      type={ReportTypeEnum.Income}
      data={mockData.income}
      title={title}
    />
  </MPGAIncomeExpensesReportTestWrapper>
);

describe('PrintTables', () => {
  it('should render with the correct data', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(await findByRole('heading', { name: title })).toBeInTheDocument();

    expect(getByRole('table')).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Description' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Contributions' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Average' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '9,013' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Total' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '108,156' })).toBeInTheDocument();
  });

  it('should calculate and display totals correctly', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(await findByRole('cell', { name: '108,856' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '9,071' })).toBeInTheDocument();
  });

  it('renders months in column headers for all months', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    await findByRole('table');
    months.forEach((m) => {
      const month = m.split(' ')[0];
      expect(getByRole('columnheader', { name: month })).toBeInTheDocument();
    });
  });

  it('should show "-" when there is no data for a month', async () => {
    const { findByRole } = render(<TestComponent />);

    const row = await findByRole('row', { name: /Fr Andre/i });
    const dashes = Array.from(row.querySelectorAll('td')).filter(
      (td) => td.textContent?.trim() === '-',
    );
    expect(dashes.length).toBe(5);
  });

  it('should show a loading spinner while data is being fetched', async () => {
    const { findByRole } = render(
      <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
        <PrintTables
          type={ReportTypeEnum.Income}
          data={mockData.income}
          title={title}
        />
      </MPGAIncomeExpensesReportTestWrapper>,
    );

    expect(await findByRole('progressbar')).toBeInTheDocument();
  });

  it('should display the correct years in the table', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('columnheader', { name: '2019' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: '2020' })).toBeInTheDocument();
  });

  it('should display empty message when no data is available', async () => {
    const { findByText } = render(
      <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy} isEmpty>
        <PrintTables type={ReportTypeEnum.Income} data={[]} title={title} />
      </MPGAIncomeExpensesReportTestWrapper>,
    );

    expect(await findByText(/no income data available/i)).toBeInTheDocument();
  });

  describe('balance table', () => {
    const balanceRows: DataFields[] = [
      {
        id: 'ending-balance',
        description: 'Ending Balance',
        monthly: months.map((_month, index) => 1000 + index),
        average: 1005.5,
        total: 0,
      },
    ];

    const BalanceComponent: React.FC = () => (
      <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
        <PrintTables
          type={ReportTypeEnum.Balance}
          data={balanceRows}
          title="Balance"
        />
      </MPGAIncomeExpensesReportTestWrapper>
    );

    it('keeps the average column but drops the total column', async () => {
      const { findByRole, queryByRole } = render(<BalanceComponent />);

      expect(
        await findByRole('columnheader', { name: 'Average' }),
      ).toBeInTheDocument();
      expect(
        queryByRole('columnheader', { name: 'Total' }),
      ).not.toBeInTheDocument();
    });

    it('does not render the overall total row', async () => {
      const { findByRole, queryByRole } = render(<BalanceComponent />);

      await findByRole('table');
      expect(
        queryByRole('cell', { name: 'Overall Total' }),
      ).not.toBeInTheDocument();
    });

    it('tells a zero balance apart from a month with no balance', async () => {
      const { findByRole } = render(
        <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
          <PrintTables
            type={ReportTypeEnum.Balance}
            data={[{ ...balanceRows[0], monthly: [0, 1000] }]}
            title="Balance"
          />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      const row = await findByRole('row', { name: /Ending Balance/ });
      const monthCells = Array.from(row.querySelectorAll('td'))
        .slice(1, 13)
        .map((td) => td.textContent?.trim());

      expect(monthCells[0]).toBe('0');
      expect(monthCells[1]).toBe('1,000');
      expect(monthCells[2]).toBe('-');
    });

    it('shows a dash for the months after the balance stops', async () => {
      const { findByRole } = render(
        <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
          <PrintTables
            type={ReportTypeEnum.Balance}
            data={[{ ...balanceRows[0], monthly: [1000, 2000, 3000] }]}
            title="Balance"
          />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      const row = await findByRole('row', { name: /Ending Balance/ });
      const cells = Array.from(row.querySelectorAll('td'));

      // description + 12 months + average (spanning the missing total column)
      expect(cells).toHaveLength(14);
      const monthCells = cells.slice(1, 13).map((td) => td.textContent?.trim());
      expect(monthCells).toEqual([
        '1,000',
        '2,000',
        '3,000',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
      ]);
    });

    it('colors a negative balance red and leaves a positive one alone', async () => {
      const { findByRole, getByText } = render(
        <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
          <PrintTables
            type={ReportTypeEnum.Balance}
            data={[
              {
                ...balanceRows[0],
                monthly: months.map((_month, index) =>
                  index === 0 ? -500 : 1000 + index,
                ),
              },
            ]}
            title="Balance"
          />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      await findByRole('table');
      expect(getByText('-500')).toHaveStyle({
        color: theme.palette.error.main,
      });
      expect(getByText('1,001')).not.toHaveStyle({
        color: theme.palette.error.main,
      });
    });

    it('renders the overall total row for the income table', async () => {
      const { findByRole, getByRole } = render(<TestComponent />);

      await findByRole('table');
      expect(getByRole('cell', { name: 'Overall Total' })).toBeInTheDocument();
    });
  });

  it('should span the correct number of months per year', async () => {
    const { getAllByRole, findByRole } = render(<TestComponent />);

    await findByRole('table');
    const headerRow = getAllByRole('row')[0];
    const yearCells = headerRow.querySelectorAll('th[scope="col"] , td');

    const year2019 = Array.from(yearCells).find((cell) =>
      cell.textContent?.includes('2019'),
    ) as HTMLTableCellElement;
    const year2020 = Array.from(yearCells).find((cell) =>
      cell.textContent?.includes('2020'),
    ) as HTMLTableCellElement;

    expect(year2019?.colSpan).toBe(11);
    expect(year2020?.colSpan).toBe(1);
  });
});
