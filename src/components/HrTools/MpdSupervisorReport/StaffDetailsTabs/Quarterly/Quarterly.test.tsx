import { ThemeProvider } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { StaffTabQuarterly } from './Quarterly';
import { QuarterlyPayrollHistoryQuery } from './QuarterlyPayrollHistory.generated';

type QuarterHistory = QuarterlyPayrollHistoryQuery['quarterlyPayrollHistory'];

const heading = 'Average monthly payroll per fiscal quarter · last 8 quarters';

const completedQuarters = [
  {
    fiscalYear: 2025,
    quarter: 4,
    averagePayroll: 4013.42,
    status: MpdHealthStatusEnum.Yellow,
  },
  {
    fiscalYear: 2026,
    quarter: 1,
    averagePayroll: 4548.05,
    status: MpdHealthStatusEnum.Green,
  },
];

const startingQuarter = {
  fiscalYear: 2025,
  quarter: 2,
  months: [
    { month: '2025-02', payroll: 4263.25, status: MpdHealthStatusEnum.Yellow },
  ],
};

const renderQuarterly = (
  quarterHistory: QuarterHistory,
  staffAccountId: string | null = '1000000001',
  mocks: ApolloErgonoMockMap = {},
) =>
  render(
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        QuarterlyPayrollHistory: QuarterlyPayrollHistoryQuery;
      }>
        mocks={
          {
            QuarterlyPayrollHistory: {
              quarterlyPayrollHistory: quarterHistory,
            },
            ...mocks,
          } as ApolloErgonoMockMap
        }
      >
        <StaffTabQuarterly staffAccountId={staffAccountId} />
      </GqlMockedProvider>
    </ThemeProvider>,
  );

describe('StaffTabQuarterly', () => {
  it('renders the heading', async () => {
    renderQuarterly({
      monthlyGrossSalary: 4510.6,
      startingQuarter: null,
      completedQuarters,
    });

    expect(await screen.findByText(heading)).toBeInTheDocument();
  });

  it('surfaces a query failure instead of an empty quarter window', async () => {
    renderQuarterly(
      { monthlyGrossSalary: 0, startingQuarter: null, completedQuarters: [] },
      '1000000001',
      {
        QuarterlyPayrollHistory: {
          quarterlyPayrollHistory: () => {
            throw new Error('Not authorized');
          },
        },
      },
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Not authorized',
    );
    expect(screen.queryByText(heading)).not.toBeInTheDocument();
  });

  it('renders a chip with the label and average payroll for each completed quarter', async () => {
    renderQuarterly({
      monthlyGrossSalary: 4510.6,
      startingQuarter: null,
      completedQuarters,
    });

    expect(await screen.findByText('FQ4 25')).toBeInTheDocument();
    expect(screen.getByText('$4,013.42')).toBeInTheDocument();
    expect(screen.getByText('FQ1 26')).toBeInTheDocument();
    expect(screen.getByText('$4,548.05')).toBeInTheDocument();
  });

  it('inserts the starting quarter in chronological order, labeled as partial', async () => {
    renderQuarterly({
      monthlyGrossSalary: 4510.6,
      startingQuarter,
      completedQuarters,
    });

    expect(await screen.findByText('FQ2 25')).toBeInTheDocument();
    expect(screen.getAllByText('Partial')).toHaveLength(1);
  });

  it('shows tooltip message on the starting quarter chip', async () => {
    renderQuarterly({
      monthlyGrossSalary: 4510.6,
      startingQuarter,
      completedQuarters,
    });

    const icon = await screen.findByTestId('InfoOutlinedIcon');
    userEvent.hover(icon);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Payroll started this quarter',
    );
  });

  it('renders no starting quarter chip when there is none', async () => {
    renderQuarterly({
      monthlyGrossSalary: 4510.6,
      startingQuarter: null,
      completedQuarters,
    });

    await screen.findByText(heading);
    expect(screen.queryByText('Partial')).not.toBeInTheDocument();
  });

  it('renders a monthly breakdown table for the starting quarter', async () => {
    renderQuarterly({
      monthlyGrossSalary: 4510.6,
      startingQuarter,
      completedQuarters,
    });

    expect(
      await screen.findByText(
        'Starting quarter monthly payroll breakdown · FQ2 25',
      ),
    ).toBeInTheDocument();
    const table = within(screen.getByRole('table'));
    expect(table.getByText('Feb 2025')).toBeInTheDocument();
    expect(table.getByText('$4,263.25')).toBeInTheDocument();
    expect(table.getByText('needs attention')).toBeInTheDocument();
  });

  it('renders no breakdown table when there is no starting quarter', async () => {
    renderQuarterly({
      monthlyGrossSalary: 4510.6,
      startingQuarter: null,
      completedQuarters,
    });

    await screen.findByText(heading);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders no chips when there are no quarters', async () => {
    renderQuarterly({
      monthlyGrossSalary: 0,
      startingQuarter: null,
      completedQuarters: [],
    });

    await screen.findByText(heading);
    expect(screen.queryByText(/^FQ/)).not.toBeInTheDocument();
  });

  it('reads N/A in every quarter when there is no staff account', async () => {
    renderQuarterly(
      {
        monthlyGrossSalary: 0,
        startingQuarter: null,
        completedQuarters: completedQuarters.map((quarter) => ({
          ...quarter,
          averagePayroll: 0,
          status: MpdHealthStatusEnum.Gray,
        })),
      },
      null,
    );

    expect(await screen.findByText('FQ4 25')).toBeInTheDocument();
    expect(screen.getAllByText('N/A')).toHaveLength(completedQuarters.length);
    expect(screen.queryByText('-')).not.toBeInTheDocument();
    expect(screen.queryByText('$0.00')).not.toBeInTheDocument();
  });

  it('renders a dash instead of $0.00 for a quarter with no payroll data', async () => {
    renderQuarterly({
      monthlyGrossSalary: 0,
      startingQuarter: null,
      completedQuarters: [
        {
          fiscalYear: 2025,
          quarter: 4,
          averagePayroll: 0,
          status: MpdHealthStatusEnum.Gray,
        },
      ],
    });

    expect(await screen.findByText('FQ4 25')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.queryByText('$0.00')).not.toBeInTheDocument();
  });
});
