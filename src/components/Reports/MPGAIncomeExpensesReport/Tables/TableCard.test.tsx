import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { TableCard } from './TableCard';

const mutationSpy = jest.fn();

const title = 'Income';

const mockData = {
  accountListId: '12345',
  accountName: 'Test Account',
  income: {
    data: [
      {
        id: crypto.randomUUID(),
        description: 'Contributions',
        monthly: [
          6770, 6090, 5770, 7355, 8035, 6575, 7556, 8239, 9799, 9729, 13020,
          19215,
        ],
        average: 9013,
        total: 108156,
      },
      {
        id: crypto.randomUUID(),
        description: 'Fr Andre, Fre to Mouna Ghar',
        monthly: [100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0],
        average: 58,
        total: 700,
      },
    ],
  },
};

const overallTotal = mockData.income.data.reduce(
  (acc, item) => acc + item.total,
  0,
);
const months = [
  'Apr 2024',
  'May 2024',
  'Jun 2024',
  'Jul 2024',
  'Aug 2024',
  'Sep 2024',
  'Oct 2024',
  'Nov 2024',
  'Dec 2024',
  'Jan 2025',
  'Feb 2025',
  'Mar 2025',
];

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <TableCard
          type={ReportTypeEnum.Income}
          data={mockData.income.data}
          overallTotal={overallTotal}
          emptyPlaceholder={<span>Empty Table</span>}
          title={title}
          months={months}
        />
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('TableCard', () => {
  it('should render with the correct data', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText(/last 12 months/i)).toBeInTheDocument();

    expect(getByRole('grid')).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Description' }),
    ).toBeInTheDocument();
    expect(
      getByRole('gridcell', { name: 'Contributions' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Average' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: '9013' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Total' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: '108156' })).toBeInTheDocument();
  });

  it('should calculate and display totals correctly', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('columnheader', { name: '108,856' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: '9,071' })).toBeInTheDocument();
  });

  it('renders months in column headers for all months', () => {
    const { getByRole } = render(<TestComponent />);
    months.forEach((m) => {
      const month = m.split(' ')[0];
      expect(getByRole('columnheader', { name: month })).toBeInTheDocument();
    });
  });

  it('should show a loading spinner while data is being fetched', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider>
            <TableCard
              type={ReportTypeEnum.Income}
              data={mockData.income.data}
              overallTotal={overallTotal}
              emptyPlaceholder={<span>Empty Table</span>}
              title={title}
              months={months}
              loading={true}
            />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display the correct years in the table', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('columnheader', { name: '2024' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: '2025' })).toBeInTheDocument();
  });

  it('should display empty placeholder when no data is available', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider>
            <TableCard
              type={ReportTypeEnum.Income}
              data={[]}
              overallTotal={0}
              emptyPlaceholder={<span>Empty Table</span>}
              title={title}
              months={months}
            />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(getByText('Empty Table')).toBeInTheDocument();
  });

  it('should render pagination', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('combobox', { name: /rows per page/i }),
    ).toBeInTheDocument();
  });

  it('updates the sort order', async () => {
    const { getAllByRole, getByRole } = render(<TestComponent />);

    const aprilHeader = getByRole('columnheader', { name: 'Apr' });
    expect(
      within(aprilHeader).getByTestId('ArrowDownwardIcon'),
    ).toBeInTheDocument();

    await userEvent.click(aprilHeader);

    await waitFor(() => {
      const aprCells = getAllByRole('gridcell').filter(
        (cell) => cell.getAttribute('data-field') === 'month0',
      );
      const values = aprCells.map((cell) => (cell.textContent ?? '').trim());
      expect(values).toEqual(['6770', '100']);
    });

    await userEvent.click(aprilHeader);
    await waitFor(() => {
      const aprCells = getAllByRole('gridcell').filter(
        (cell) => cell.getAttribute('data-field') === 'month0',
      );
      const values = aprCells.map((cell) => (cell.textContent ?? '').trim());
      expect(values).toEqual(['100', '6770']);
    });
  });
});
