import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import theme from 'src/theme';
import { MonthlyPayrollSummaryQuery } from './MonthlyPayrollSummary.generated';
import { StaffTabMonthlySummary } from './MonthlySummary';

type MonthlySummary = MonthlyPayrollSummaryQuery['monthlyPayrollSummary'];

jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <OriginalModule.ResponsiveContainer width={800} height={800}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  };
});

const mockMonthlySummary: MonthlySummary = [
  {
    month: '2023-01',
    contributions: 4000,
    expenses: 3500,
    net: 500,
    endBalance: 10000,
  },
  {
    month: '2023-02',
    contributions: 4200,
    expenses: 4500,
    net: -300,
    endBalance: 9700,
  },
  {
    month: '2023-03',
    contributions: 3000,
    expenses: 3200,
    net: -200,
    endBalance: -100,
  },
];

interface TestComponentProps {
  monthlySummary: MonthlySummary;
  staffAccountId?: string | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  monthlySummary,
  staffAccountId = '1000000001',
}) => {
  return (
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{ MonthlyPayrollSummary: MonthlyPayrollSummaryQuery }>
        mocks={{
          MonthlyPayrollSummary: { monthlyPayrollSummary: monthlySummary },
        }}
      >
        <StaffTabMonthlySummary staffAccountId={staffAccountId} />
      </GqlMockedProvider>
    </ThemeProvider>
  );
};

const columnHeaders = [
  'Month',
  'Contributions',
  'Expenses',
  'Net',
  'End Balance',
];

describe('StaffTabMonthlySummary', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('renders the headers and a row per month, showing negative net and end balance in parentheses without a minus sign', async () => {
    const { findByRole } = render(
      <TestComponent monthlySummary={mockMonthlySummary} />,
    );

    expect(await findByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: [
        ['Jan 2023', '$4,000.00', '($3,500.00)', '$500.00', '$10,000.00'],
        ['Feb 2023', '$4,200.00', '($4,500.00)', '($300.00)', '$9,700.00'],
        ['Mar 2023', '$3,000.00', '($3,200.00)', '($200.00)', '($100.00)'],
      ],
    });
  });

  it('renders a blank month, zeroed amounts, and a placeholder end balance when the summary fields are null', async () => {
    const { findByRole } = render(
      <TestComponent
        monthlySummary={[
          {
            month: null,
            contributions: null,
            expenses: null,
            net: null,
            endBalance: null,
          },
        ]}
      />,
    );

    expect(await findByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: [['', '$0.00', '($0.00)', '$0.00', '—']],
    });
  });

  it('colors net green when positive, red when negative, and the default text color when exactly zero', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent
        monthlySummary={[
          {
            month: '2023-01',
            contributions: 4000,
            expenses: 3500,
            net: 500,
            endBalance: 10000,
          },
          {
            month: '2023-02',
            contributions: 4200,
            expenses: 4500,
            net: -300,
            endBalance: 9700,
          },
          {
            month: '2023-03',
            contributions: 4000,
            expenses: 4000,
            net: 0,
            endBalance: 9700,
          },
        ]}
      />,
    );

    await findByRole('table');

    expect(getByRole('cell', { name: '$500.00' })).toHaveStyle({
      color: theme.palette.success.main,
    });
    expect(getByRole('cell', { name: '($300.00)' })).toHaveStyle({
      color: theme.palette.error.main,
    });
    expect(getByRole('cell', { name: '$0.00' })).toHaveStyle({
      color: 'inherit',
    });
  });

  it('renders an empty-state row when the monthly summary is empty', async () => {
    const { findByRole } = render(<TestComponent monthlySummary={[]} />);

    expect(await findByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: ['No data available.'],
    });
  });

  it('renders the empty state when there is no staff account', async () => {
    const { findByRole } = render(
      <TestComponent monthlySummary={[]} staffAccountId={null} />,
    );

    expect(await findByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: ['No data available.'],
    });
  });

  it('switches to the chart view and back when the toggle is clicked', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <TestComponent monthlySummary={mockMonthlySummary} />,
    );

    userEvent.click(await findByRole('button', { name: 'Chart view' }));

    expect(await findByRole('region')).toBeInTheDocument();
    expect(queryByRole('table')).not.toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Table view' }));

    expect(getByRole('table')).toBeInTheDocument();
  });

  it('switches to the chart view even when there is no data', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent monthlySummary={[]} />,
    );

    userEvent.click(await findByRole('button', { name: 'Chart view' }));

    expect(await findByRole('region')).toBeInTheDocument();
    expect(queryByRole('table')).not.toBeInTheDocument();
  });
});
