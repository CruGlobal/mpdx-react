import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { PrintTables } from './PrintTables';

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
        <PrintTables
          type={ReportTypeEnum.Income}
          data={mockData.income.data}
          overallTotal={overallTotal}
          title={title}
          months={months}
        />
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('PrintTables', () => {
  it('should renders with the correct data', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('heading', { name: title })).toBeInTheDocument();

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

  it('should calculate and display totals correctly', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('cell', { name: '108,856' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '9,071' })).toBeInTheDocument();
  });

  it('renders months in column headers for all months', () => {
    const { getByRole } = render(<TestComponent />);
    months.forEach((m) => {
      const month = m.split(' ')[0];
      expect(getByRole('columnheader', { name: month })).toBeInTheDocument();
    });
  });

  it('should show "-" when there is no data for a month', () => {
    const { getByRole } = render(<TestComponent />);

    const row = getByRole('row', { name: /Fr Andre/i });
    const dashes = Array.from(row.querySelectorAll('td')).filter(
      (td) => td.textContent?.trim() === '-',
    );
    expect(dashes.length).toBe(5);
  });

  it('should show a loading spinner while data is being fetched', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider>
            <PrintTables
              type={ReportTypeEnum.Income}
              data={mockData.income.data}
              overallTotal={overallTotal}
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

  it('should display empty message when no data is available', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider>
            <PrintTables
              type={ReportTypeEnum.Income}
              data={[]}
              overallTotal={0}
              title={title}
              months={months}
            />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(getByText(/no income data available/i)).toBeInTheDocument();
  });

  it('should span the correct number of months per year', () => {
    const { getAllByRole } = render(<TestComponent />);

    const headerRow = getAllByRole('row')[0];
    const yearCells = headerRow.querySelectorAll('th[scope="col"] , td');

    const year2024 = Array.from(yearCells).find((cell) =>
      cell.textContent?.includes('2024'),
    ) as HTMLTableCellElement;
    const year2025 = Array.from(yearCells).find((cell) =>
      cell.textContent?.includes('2025'),
    ) as HTMLTableCellElement;

    expect(year2024?.colSpan).toBe(9);
    expect(year2025?.colSpan).toBe(3);
  });
});
