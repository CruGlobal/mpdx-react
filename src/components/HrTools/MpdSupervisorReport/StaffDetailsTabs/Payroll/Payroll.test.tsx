import { ThemeProvider } from '@mui/material/styles';
import { render } from '__tests__/util/testingLibraryReactMock';
import { MonthlyPayrollHistory } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { StaffTabPayroll } from './Payroll';

const mockPayrollHistory: MonthlyPayrollHistory[] = [
  {
    month: '2023-01',
    payroll: 3000,
    additionalSalary: 500,
    reimbursement: 200,
    percentMaxPay: 80,
  },
  {
    month: '2023-02',
    payroll: 3200,
    additionalSalary: 400,
    reimbursement: 150,
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
  it('renders the headers and a row per month, summing reimbursement and additional salary', () => {
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
            additionalSalary: 500,
            reimbursement: null,
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

  it('renders a dash for reimbursement/additional salary only when both are null', () => {
    const { getByRole } = render(
      <TestComponent
        payrollHistory={[
          {
            month: '2023-01',
            payroll: 3000,
            additionalSalary: null,
            reimbursement: null,
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
});
