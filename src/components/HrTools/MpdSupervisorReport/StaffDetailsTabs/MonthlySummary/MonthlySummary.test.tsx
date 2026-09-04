import { ThemeProvider } from '@mui/material/styles';
import { render } from '__tests__/util/testingLibraryReactMock';
import { MonthlyPayrollSummary } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { StaffTabMonthlySummary } from './MonthlySummary';

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
      color: theme.palette.chipGreenDark.main,
    });
    expect(getByRole('cell', { name: '($300.00)' })).toHaveStyle({
      color: theme.palette.chipRedDark.main,
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
});
