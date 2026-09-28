import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import {
  PeopleGroupSupportTypeEnum,
  SecaStatusEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { StaffRow, pendingField } from '../helpers';
import { managedStaffMember } from '../mpdSupervisorReportMocks';
import { QuickGlance } from './QuickGlance';

const renderGlance = (row: StaffRow) =>
  render(
    <ThemeProvider theme={theme}>
      <QuickGlance row={row} />
    </ThemeProvider>,
  );

describe('QuickGlance', () => {
  it('shows every detail for a fully populated member', () => {
    const { getByTestId } = renderGlance(managedStaffMember());
    const glance = getByTestId('quick-glance');
    expect(glance).toHaveTextContent('Person number10000001');
    expect(glance).toHaveTextContent('Staff account1000000001');
    expect(glance).toHaveTextContent('DepartmentUS Campus');
    expect(glance).toHaveTextContent('Geographic locationOrlando, FL');
    expect(glance).toHaveTextContent('New Staff Monthly Salary$2,500.00');
    expect(glance).toHaveTextContent('Monthly Gross Salary$4,500.00');
    expect(glance).toHaveTextContent('Tenure6 years');
    expect(glance).toHaveTextContent('Healthcare dependents2');
    expect(glance).toHaveTextContent('Support typeSupported RMO');
    expect(glance).toHaveTextContent('SECASubject to SECA');
    expect(glance).toHaveTextContent('SpouseJane Smith');
    expect(glance).not.toHaveTextContent('Payroll started');
  });

  it('shows the placeholder for each missing field', () => {
    const { getByTestId } = renderGlance(
      managedStaffMember({
        teams: {
          employee: [{ id: 't', name: 'Team', department: null }],
          spouse: [],
        },
        geographicLocation: null,
        newStaffMonthlySalary: null,
        tenure: null,
        healthcareDependentsCount: null,
        peopleGroupSupportType: null,
        secaStatus: null,
        spouseFirstName: null,
        quarterlyHealth: { monthlyGrossSalary: null, completedQuarters: [] },
      }),
    );
    const glance = getByTestId('quick-glance');
    for (const label of [
      'Department',
      'Geographic location',
      'New Staff Monthly Salary',
      'Monthly Gross Salary',
      'Tenure',
      'Healthcare dependents',
      'Support type',
      'SECA',
    ]) {
      expect(glance).toHaveTextContent(`${label}${pendingField}`);
    }
    expect(glance).not.toHaveTextContent('Spouse');
  });

  it('marks a Monthly Gross Salary below the New Staff benchmark', () => {
    const { getByTestId, getByLabelText } = renderGlance(
      managedStaffMember({
        newStaffMonthlySalary: 5000,
        quarterlyHealth: { monthlyGrossSalary: 4500, completedQuarters: [] },
      }),
    );
    expect(getByTestId('quick-glance')).toHaveTextContent('$4,500.00');
    expect(getByLabelText(/is \$500\.00 below/)).toBeInTheDocument();
  });

  it('names the starting quarter', () => {
    const { getByTestId } = renderGlance(
      managedStaffMember({
        quarterlyHealth: {
          monthlyGrossSalary: 4500,
          completedQuarters: [],
          startingQuarter: { fiscalYear: 2026, quarter: 2, months: [] },
        },
      }),
    );
    expect(getByTestId('quick-glance')).toHaveTextContent(
      'Payroll startedFQ2 26',
    );
  });

  describe('a merged couple', () => {
    const partner = managedStaffMember({
      firstName: 'Jane',
      personNumber: '10000002',
      tenure: 3,
      healthcareDependentsCount: 0,
      peopleGroupSupportType: PeopleGroupSupportTypeEnum.Designation,
      secaStatus: SecaStatusEnum.Optout,
      teams: {
        employee: [{ id: 'city', name: 'City', department: 'US City' }],
        spouse: [],
      },
    });
    const pair: StaffRow = { ...managedStaffMember(), partner };

    it('lists both person numbers, both departments and the partner as spouse', () => {
      const { getByTestId } = renderGlance(pair);
      const glance = getByTestId('quick-glance');
      expect(glance).toHaveTextContent('Person numbers10000001 & 10000002');
      expect(glance).toHaveTextContent('DepartmentUS Campus, US City');
      expect(glance).toHaveTextContent('SpouseJane Smith');
    });

    it('shows the per-person HR fields on a line per spouse', () => {
      const { getByTestId, getByText } = renderGlance(pair);
      const glance = getByTestId('quick-glance');
      expect(glance).toHaveTextContent('TenureJohn: 6 yearsJane: 3 years');
      expect(glance).toHaveTextContent('Healthcare dependentsJohn: 2Jane: 0');
      expect(glance).toHaveTextContent(
        'Support typeJohn: Supported RMOJane: Designation',
      );
      expect(glance).toHaveTextContent('SECAJohn: Subject to SECAJane: Exempt');
      // Each person's value is its own line
      expect(getByText('John: 6 years').tagName).toBe('SPAN');
      expect(getByText('Jane: 3 years').tagName).toBe('SPAN');
    });
  });
});
