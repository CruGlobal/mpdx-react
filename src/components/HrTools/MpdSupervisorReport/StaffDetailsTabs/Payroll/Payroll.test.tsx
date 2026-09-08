import { ThemeProvider } from '@mui/material/styles';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import { MonthlyPayrollHistoryQuery } from './MonthlyPayrollHistory.generated';
import { StaffTabPayroll } from './Payroll';

type PayrollHistory = MonthlyPayrollHistoryQuery['monthlyPayrollHistory'];

const mockPayrollHistory: PayrollHistory = [
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
  payrollHistory?: PayrollHistory;
  staffAccountId?: string | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  payrollHistory = mockPayrollHistory,
  staffAccountId = '1000000001',
}) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{ MonthlyPayrollHistory: MonthlyPayrollHistoryQuery }>
      mocks={{
        MonthlyPayrollHistory: { monthlyPayrollHistory: payrollHistory },
      }}
    >
      <StaffTabPayroll staffAccountId={staffAccountId} />
    </GqlMockedProvider>
  </ThemeProvider>
);

const columnHeaders = [
  'Month',
  'Payroll',
  'Reimbursement / Additional Salary',
  '% Max Pay',
];

describe('StaffTabPayroll', () => {
  it('renders the headers and a row per month', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(await findByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: [
        ['Jan 2023', '$3,000.00', '$700.00', '80.0%'],
        ['Feb 2023', '$3,200.00', '$550.00', '85.0%'],
      ],
    });
  });

  it('renders an empty-state row when payroll history is empty', async () => {
    const { findByRole } = render(<TestComponent payrollHistory={[]} />);

    expect(await findByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: ['No data available.'],
    });
  });

  it('renders the empty state when there is no staff account', async () => {
    const { findByRole } = render(<TestComponent staffAccountId={null} />);

    expect(await findByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: ['No data available.'],
    });
  });

  it('renders a dash for null fields and an empty cell for a missing month', async () => {
    const { findByRole } = render(
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

    expect(await findByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: [['', '—', '$500.00', '—']],
    });
  });

  it('renders a dash when asrAndReimbursements is null', async () => {
    const { findByRole } = render(
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

    expect(await findByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: [['Jan 2023', '$3,000.00', '—', '80.0%']],
    });
  });

  it('renders zero values rather than a dash', async () => {
    const { findByRole } = render(
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

    expect(await findByRole('table')).toHaveTableStructure({
      columnHeaders,
      cells: [['Jan 2023', '$0.00', '$0.00', '0.0%']],
    });
  });
});
