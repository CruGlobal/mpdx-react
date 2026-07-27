import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { MPGAIncomeExpensesReportTestWrapper } from '../MPGAIncomeExpensesReportTestWrapper';
import { mockData, months } from '../mockData';
import { TableCard } from './TableCard';

const mutationSpy = jest.fn();

const title = 'Income';

const data = {
  income: mockData.income,
  expenses: [],
};

const cellText = (element: HTMLElement) => element.textContent;

const TestComponent: React.FC = () => (
  <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
    <TableCard
      type={ReportTypeEnum.Income}
      data={data.income}
      breakdownData={mockData.incomeBreakdown}
      emptyPlaceholder={<span>Empty Table</span>}
      title={title}
    />
  </MPGAIncomeExpensesReportTestWrapper>
);

describe('TableCard', () => {
  it('should render with the correct data', async () => {
    const { getAllByRole, findByText, getByText } = render(<TestComponent />);

    expect(await findByText(title)).toBeInTheDocument();
    expect(getByText(/last 12 months/i)).toBeInTheDocument();

    expect(getAllByRole('columnheader').map(cellText)).toEqual(
      expect.arrayContaining(['Description', 'Average', 'Total']),
    );
    expect(getAllByRole('gridcell').map(cellText)).toEqual(
      expect.arrayContaining(['Contributions', '9,013', '108,156']),
    );
  });

  it('should calculate and display totals correctly', async () => {
    const { getAllByRole, findByText } = render(<TestComponent />);

    await findByText(title);
    expect(getAllByRole('gridcell').map(cellText)).toEqual(
      expect.arrayContaining(['108,856', '9,071']),
    );
  });

  it('renders months in column headers for all months', async () => {
    const { getAllByRole, findByText } = render(<TestComponent />);

    await findByText(title);
    const headerNames = getAllByRole('columnheader').map(cellText);

    months.forEach((month) => {
      expect(headerNames).toContain(month.split(' ')[0]);
    });
  });

  it('should show a loading spinner while data is being fetched', () => {
    const { getByRole } = render(
      <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
        <TableCard
          type={ReportTypeEnum.Income}
          data={data.income}
          emptyPlaceholder={<span>Empty Table</span>}
          title={title}
        />
      </MPGAIncomeExpensesReportTestWrapper>,
    );

    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display the correct years in the table', async () => {
    const { getAllByRole, findByText } = render(<TestComponent />);

    await findByText(title);
    expect(getAllByRole('columnheader').map(cellText)).toEqual(
      expect.arrayContaining(['2019', '2020']),
    );
  });

  it('should apply the correct color to each group header', async () => {
    const { getByText, findByText } = render(<TestComponent />);

    expect(await findByText('2019')).toHaveStyle({
      color: theme.palette.primary.main,
    });
    expect(getByText('2020')).toHaveStyle({
      color: theme.palette.chartOrange.main,
    });
    expect(getByText('Summary')).toHaveStyle({
      color: theme.palette.chartGray.main,
    });
  });

  it('should display empty placeholder when no data is available', async () => {
    const { findByText } = render(
      <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
        <TableCard
          type={ReportTypeEnum.Income}
          data={[]}
          emptyPlaceholder={<span>Empty Table</span>}
          title={title}
        />
      </MPGAIncomeExpensesReportTestWrapper>,
    );

    expect(await findByText('Empty Table')).toBeInTheDocument();
  });

  describe('breakdown modal', () => {
    it('shows the icon only on rows that have breakdown data', async () => {
      const { findAllByRole } = render(<TestComponent />);

      const icons = await findAllByRole('button', { name: 'View breakdown' });
      expect(icons).toHaveLength(1);
    });

    it('opens the modal for the clicked category', async () => {
      const { findByRole } = render(<TestComponent />);

      userEvent.click(await findByRole('button', { name: 'View breakdown' }));

      const dialog = await findByRole('dialog');
      expect(
        within(dialog).getByText('Donation Breakdown'),
      ).toBeInTheDocument();
    });

    it('renders an accordion per subcategory with the overall total', async () => {
      const { findByRole } = render(<TestComponent />);

      userEvent.click(await findByRole('button', { name: 'View breakdown' }));

      const dialog = await findByRole('dialog');
      expect(within(dialog).getByText('Donation')).toBeInTheDocument();
      expect(
        within(dialog).getByText('Donation - Non Cash'),
      ).toBeInTheDocument();
      expect(
        within(dialog).getByText('Total Donation Income'),
      ).toBeInTheDocument();
      expect(within(dialog).getByText('$6,770.00')).toBeInTheDocument();
    });

    it('closes the modal', async () => {
      const { findByRole, queryByRole } = render(<TestComponent />);

      userEvent.click(await findByRole('button', { name: 'View breakdown' }));

      const dialog = await findByRole('dialog');
      userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));

      await waitFor(() =>
        expect(queryByRole('dialog')).not.toBeInTheDocument(),
      );
    });
  });

  it('updates the sort order', async () => {
    const { getAllByRole, findByText } = render(<TestComponent />);

    await findByText(title);
    const aprilHeader = getAllByRole('columnheader').find(
      (header) => header.getAttribute('data-field') === 'month0',
    ) as HTMLElement;
    expect(
      within(aprilHeader).getByTestId('ArrowDownwardIcon'),
    ).toBeInTheDocument();

    userEvent.click(aprilHeader);

    await waitFor(() => {
      const aprCells = getAllByRole('gridcell').filter(
        (cell) => cell.getAttribute('data-field') === 'month0',
      );
      const values = aprCells.map((cell) => (cell.textContent ?? '').trim());
      expect(values).toEqual(['6,770', '100', '-']);
    });

    userEvent.click(aprilHeader);
    await waitFor(() => {
      const aprCells = getAllByRole('gridcell').filter(
        (cell) => cell.getAttribute('data-field') === 'month0',
      );
      const values = aprCells.map((cell) => (cell.textContent ?? '').trim());
      expect(values).toEqual(['-', '100', '6,770']);
    });
  });
});
