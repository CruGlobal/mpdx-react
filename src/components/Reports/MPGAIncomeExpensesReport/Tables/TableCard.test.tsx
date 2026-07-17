import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { TotalsProvider } from '../TotalsContext/TotalsContext';
import { mockData, months } from '../mockData';
import { TableCard } from './TableCard';

const mutationSpy = jest.fn();

const title = 'Income';

const data = {
  income: mockData.income,
  expenses: [],
};

const emptyData = {
  income: [],
  expenses: [],
};

const cellText = (element: HTMLElement) => element.textContent;

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <TotalsProvider data={data}>
          <TableCard
            type={ReportTypeEnum.Income}
            data={data.income}
            breakdownData={mockData.incomeBreakdown}
            emptyPlaceholder={<span>Empty Table</span>}
            title={title}
            months={months}
          />
        </TotalsProvider>
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('TableCard', () => {
  it('should render with the correct data', () => {
    const { getAllByRole, getByText } = render(<TestComponent />);

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText(/last 12 months/i)).toBeInTheDocument();

    expect(getAllByRole('columnheader').map(cellText)).toEqual(
      expect.arrayContaining(['Description', 'Average', 'Total']),
    );
    expect(getAllByRole('gridcell').map(cellText)).toEqual(
      expect.arrayContaining(['Contributions', '9,013', '108,156']),
    );
  });

  it('should calculate and display totals correctly', () => {
    const { getAllByRole } = render(<TestComponent />);

    expect(getAllByRole('gridcell').map(cellText)).toEqual(
      expect.arrayContaining(['108,856', '9,071']),
    );
  });

  it('renders months in column headers for all months', () => {
    const { getAllByRole } = render(<TestComponent />);

    const headerNames = getAllByRole('columnheader').map(cellText);

    months.forEach((month) => {
      expect(headerNames).toContain(month.split(' ')[0]);
    });
  });

  it('should show a loading spinner while data is being fetched', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider>
            <TotalsProvider data={data} loading>
              <TableCard
                type={ReportTypeEnum.Income}
                data={data.income}
                emptyPlaceholder={<span>Empty Table</span>}
                title={title}
                months={months}
              />
            </TotalsProvider>
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display the correct years in the table', () => {
    const { getAllByRole } = render(<TestComponent />);

    expect(getAllByRole('columnheader').map(cellText)).toEqual(
      expect.arrayContaining(['2024', '2025']),
    );
  });

  it('should apply the correct color to each group header', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('2024')).toHaveStyle({
      color: theme.palette.primary.main,
    });
    expect(getByText('2025')).toHaveStyle({
      color: theme.palette.chartOrange.main,
    });
    expect(getByText('Summary')).toHaveStyle({
      color: theme.palette.chartGray.main,
    });
  });

  it('should display empty placeholder when no data is available', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider>
            <TotalsProvider data={emptyData}>
              <TableCard
                type={ReportTypeEnum.Income}
                data={[]}
                emptyPlaceholder={<span>Empty Table</span>}
                title={title}
                months={months}
              />
            </TotalsProvider>
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(getByText('Empty Table')).toBeInTheDocument();
  });

  describe('breakdown modal', () => {
    it('shows the icon only on rows that have breakdown data', () => {
      const { getAllByRole } = render(<TestComponent />);

      const icons = getAllByRole('button', { name: 'View breakdown' });
      expect(icons).toHaveLength(1);
    });

    it('opens the modal for the clicked category', async () => {
      const { getByRole, findByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'View breakdown' }));

      const dialog = await findByRole('dialog');
      expect(
        within(dialog).getByText('Donation Breakdown'),
      ).toBeInTheDocument();
    });

    it('renders an accordion per subcategory with the overall total', async () => {
      const { getByRole, findByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'View breakdown' }));

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
      const { getByRole, findByRole, queryByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'View breakdown' }));

      const dialog = await findByRole('dialog');
      userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));

      await waitFor(() =>
        expect(queryByRole('dialog')).not.toBeInTheDocument(),
      );
    });
  });

  it('updates the sort order', async () => {
    const { getAllByRole } = render(<TestComponent />);

    const aprilHeader = getAllByRole('columnheader').find(
      (header) => header.getAttribute('data-field') === 'month0',
    ) as HTMLElement;
    expect(
      within(aprilHeader).getByTestId('ArrowDownwardIcon'),
    ).toBeInTheDocument();

    await userEvent.click(aprilHeader);

    await waitFor(() => {
      const aprCells = getAllByRole('gridcell').filter(
        (cell) => cell.getAttribute('data-field') === 'month0',
      );
      const values = aprCells.map((cell) => (cell.textContent ?? '').trim());
      expect(values).toEqual(['6,770', '100', '-']);
    });

    await userEvent.click(aprilHeader);
    await waitFor(() => {
      const aprCells = getAllByRole('gridcell').filter(
        (cell) => cell.getAttribute('data-field') === 'month0',
      );
      const values = aprCells.map((cell) => (cell.textContent ?? '').trim());
      expect(values).toEqual(['-', '100', '6,770']);
    });
  });
});
