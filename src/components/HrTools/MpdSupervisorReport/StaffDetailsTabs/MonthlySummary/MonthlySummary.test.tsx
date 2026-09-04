import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { render } from '__tests__/util/testingLibraryReactMock';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { MonthlyPayrollSummary } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { StaffTabMonthlySummary } from './MonthlySummary';

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

const mockMonthlySummary: MonthlyPayrollSummary[] = [
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
  monthlySummary: MonthlyPayrollSummary[];
}

const TestComponent: React.FC<TestComponentProps> = ({ monthlySummary }) => {
  return (
    <ThemeProvider theme={theme}>
      <StaffTabMonthlySummary monthlySummary={monthlySummary} />
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

  it('renders the headers and a row per month, showing negative net and end balance in parentheses without a minus sign', () => {
    const { getByRole } = render(
      <TestComponent monthlySummary={mockMonthlySummary} />,
    );

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: [
        ['Jan 2023', '$4,000.00', '($3,500.00)', '$500.00', '$10,000.00'],
        ['Feb 2023', '$4,200.00', '($4,500.00)', '($300.00)', '$9,700.00'],
        ['Mar 2023', '$3,000.00', '($3,200.00)', '($200.00)', '($100.00)'],
      ],
    });
  });

  it('renders a blank month, zeroed amounts, and a placeholder end balance when the summary fields are null', () => {
    const { getByRole } = render(
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

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: [['', '$0.00', '($0.00)', '$0.00', '—']],
    });
  });

  it('colors net green when positive, red when negative, and the default text color when exactly zero', () => {
    const { getByRole } = render(
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

  it('renders an empty-state row when the monthly summary is empty', () => {
    const { getByRole } = render(<TestComponent monthlySummary={[]} />);

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: ['No data available.'],
    });
  });

  it('switches to the chart view and back when the toggle is clicked', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <TestComponent monthlySummary={mockMonthlySummary} />,
    );

    userEvent.click(getByRole('button', { name: 'Chart view' }));

    expect(await findByRole('region')).toBeInTheDocument();
    expect(queryByRole('table')).not.toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Table view' }));

    expect(getByRole('table')).toBeInTheDocument();
  });

  it('switches to the chart view even when there is no data', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <TestComponent monthlySummary={[]} />,
    );

    userEvent.click(getByRole('button', { name: 'Chart view' }));

    expect(await findByRole('region')).toBeInTheDocument();
    expect(queryByRole('table')).not.toBeInTheDocument();
  });
});
