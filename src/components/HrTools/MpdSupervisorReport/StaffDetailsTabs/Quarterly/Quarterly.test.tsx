import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import {
  CompletedQuarterPayroll,
  MpdHealthStatusEnum,
  QuarterlyPayrollHistory,
  StartingQuarterPayroll,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { StaffTabQuarterly } from './Quarterly';

const completedQuarters: CompletedQuarterPayroll[] = [
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

const startingQuarter: StartingQuarterPayroll = {
  fiscalYear: 2025,
  quarter: 2,
  months: [
    { month: '2025-02', payroll: 4263.25, status: MpdHealthStatusEnum.Yellow },
  ],
};

const renderQuarterly = (quarterHistory: QuarterlyPayrollHistory) =>
  render(
    <ThemeProvider theme={theme}>
      <StaffTabQuarterly quarterHistory={quarterHistory} />
    </ThemeProvider>,
  );

describe('StaffTabQuarterly', () => {
  it('renders the heading', () => {
    renderQuarterly({ monthlyGrossSalary: 4510.6, completedQuarters });

    expect(
      screen.getByText(
        'Average monthly payroll per fiscal quarter - last 8 quarters',
      ),
    ).toBeInTheDocument();
  });

  it('renders a chip with the label and average payroll for each completed quarter', () => {
    renderQuarterly({ monthlyGrossSalary: 4510.6, completedQuarters });

    expect(screen.getByText('FQ4 25')).toBeInTheDocument();
    expect(screen.getByText('$4,013.42')).toBeInTheDocument();
    expect(screen.getByText('FQ1 26')).toBeInTheDocument();
    expect(screen.getByText('$4,548.05')).toBeInTheDocument();
  });

  it('inserts the starting quarter in chronological order, labeled as partial', () => {
    renderQuarterly({
      monthlyGrossSalary: 4510.6,
      startingQuarter,
      completedQuarters,
    });

    expect(screen.getByText('FQ2 25')).toBeInTheDocument();
    expect(screen.getAllByText('Partial')).toHaveLength(1);
  });

  it('renders no starting quarter chip when there is none', () => {
    renderQuarterly({ monthlyGrossSalary: 4510.6, completedQuarters });

    expect(screen.queryByText('Partial')).not.toBeInTheDocument();
  });
});
