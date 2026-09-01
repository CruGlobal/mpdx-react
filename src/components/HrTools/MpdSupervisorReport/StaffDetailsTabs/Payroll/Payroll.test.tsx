import { ThemeProvider } from '@mui/material/styles';
import { render } from '__tests__/util/testingLibraryReactMock';
import { MonthlyPayrollHistory } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { StaffTabPayroll } from './Payroll';

const mockPayrollHistory: MonthlyPayrollHistory[] = [
  {
    month: '2023-01',
    payroll: 3000,
    asrAndReimbursements: 700,
    percentMaxPay: 80,
  },
  {
    month: '2023-02',
    payroll: 3200,
    asrAndReimbursements: 550,
    percentMaxPay: 85,
  },
];

interface TestComponentProps {
  payrollHistory: MonthlyPayrollHistory[];
}

const TestComponent: React.FC<TestComponentProps> = ({ payrollHistory }) => {
  return (
    <ThemeProvider theme={theme}>
      <StaffTabPayroll payrollHistory={payrollHistory} />
    </ThemeProvider>
  );
};

const columnHeaders = [
  'Month',
  'Payroll',
  'Reimbursement / Additional Salary',
  '% Max Pay',
];

describe('StaffTabPayroll', () => {
  it('renders the headers and a row per month', () => {
    const { getByRole } = render(
      <TestComponent payrollHistory={mockPayrollHistory} />,
    );

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: [
        ['Jan 2023', '$3,000.00', '$700.00', '80.0%'],
        ['Feb 2023', '$3,200.00', '$550.00', '85.0%'],
      ],
    });
  });

  it('renders an empty-state row when payroll history is empty', () => {
    const { getByRole } = render(<TestComponent payrollHistory={[]} />);

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: ['No data available.'],
    });
  });

  it('renders a dash for null fields and an empty cell for a missing month', () => {
    const { getByRole } = render(
      <TestComponent
        payrollHistory={[
          {
            month: null,
            payroll: null,
            asrAndReimbursements: 500,
            percentMaxPay: null,
          },
        ]}
      />,
    );

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: [['', '—', '$500.00', '—']],
    });
  });

  it('renders a dash when asrAndReimbursements is null', () => {
    const { getByRole } = render(
      <TestComponent
        payrollHistory={[
          {
            month: '2023-01',
            payroll: 3000,
            asrAndReimbursements: null,
            percentMaxPay: 80,
          },
        ]}
      />,
    );

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: [['Jan 2023', '$3,000.00', '—', '80.0%']],
    });
  });

  it('renders a dash when fields are undefined, not just null', () => {
    const { getByRole } = render(
      <TestComponent payrollHistory={[{ month: '2023-01' }]} />,
    );

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: [['Jan 2023', '—', '—', '—']],
    });
  });

  it('renders zero values rather than a dash', () => {
    const { getByRole } = render(
      <TestComponent
        payrollHistory={[
          {
            month: '2023-01',
            payroll: 0,
            asrAndReimbursements: 0,
            percentMaxPay: 0,
          },
        ]}
      />,
    );

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: [['Jan 2023', '$0.00', '$0.00', '0.0%']],
    });
  });
});
