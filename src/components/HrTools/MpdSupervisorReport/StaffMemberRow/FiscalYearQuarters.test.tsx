import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { buildQuarterChips } from '../helpers';
import { managedStaffMember } from '../mpdSupervisorReportMocks';
import { FiscalYearQuarters } from './FiscalYearQuarters';

type QuarterlyHealth = ReturnType<typeof managedStaffMember>['quarterlyHealth'];

const renderQuarters = (
  quarterlyHealth: QuarterlyHealth = managedStaffMember().quarterlyHealth,
) =>
  render(
    <ThemeProvider theme={theme}>
      <FiscalYearQuarters quarters={buildQuarterChips(quarterlyHealth)} />
    </ThemeProvider>,
  );

// The drawer header keeps these pay chips; the row shows month-end balances.
describe('FiscalYearQuarters', () => {
  it('renders a currency-formatted payroll chip for each quarter', () => {
    const { getByText } = renderQuarters();
    expect(getByText('$4,600.00')).toBeInTheDocument();
    expect(getByText('$3,500.00')).toBeInTheDocument();
    expect(getByText('$2,200.00')).toBeInTheDocument();
    expect(getByText('$4,500.00')).toBeInTheDocument();
  });

  it('labels a quarter payroll started partway through as Partial', () => {
    const { getByText } = renderQuarters({
      monthlyGrossSalary: 4500,
      completedQuarters: [],
      startingQuarter: { fiscalYear: 2026, quarter: 3, months: [] },
    });
    expect(getByText('Partial')).toBeInTheDocument();
  });

  it('renders a dash instead of $0.00 for a quarter with no payroll data', () => {
    const { getByText, queryByText } = renderQuarters({
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

    expect(getByText('-')).toBeInTheDocument();
    expect(queryByText('$0.00')).not.toBeInTheDocument();
    expect(getByText('FQ4 25, no data')).toBeInTheDocument();
  });
});
