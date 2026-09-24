import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { RowDensityEnum } from '../MpdSupervisorReportContext';
import { ManagedStaffMember } from '../helpers';
import { managedStaffMember } from '../mpdSupervisorReportMocks';
import { StaffMember } from './StaffMember';

const member = managedStaffMember({
  firstName: 'Brooke',
  lastName: 'Butler',
  teams: {
    employee: [
      { id: 'team-1', name: 'FamilyLife', department: 'US FamilyLife' },
    ],
    spouse: [],
  },
});

const renderRow = (onClick = jest.fn(), data: ManagedStaffMember = member) => ({
  onClick,
  ...render(
    <ThemeProvider theme={theme}>
      <StaffMember data={data} onClick={onClick} />
    </ThemeProvider>,
  ),
});

describe('StaffMember', () => {
  it('renders the staff member name as "{firstName} {lastName}"', () => {
    const { getByText } = renderRow();
    expect(getByText('Brooke Butler')).toBeInTheDocument();
  });

  it('shows avatar initials in the comfortable layout', () => {
    const { getByText } = renderRow();
    expect(getByText('BB')).toBeInTheDocument();
  });

  it('names a spouse who is not merged into the row', () => {
    const { getByTestId } = renderRow();
    expect(getByTestId('person-numbers')).toHaveTextContent(
      'Spouse: Jane Smith',
    );
  });

  it('omits the spouse line when there is no spouse', () => {
    const { getByTestId } = renderRow(
      jest.fn(),
      managedStaffMember({ ...member, spouseFirstName: null }),
    );
    expect(getByTestId('person-numbers')).not.toHaveTextContent('Spouse:');
  });

  describe('a merged spouse pair', () => {
    const partner = managedStaffMember({
      firstName: 'Ben',
      lastName: 'Butler',
      personNumber: '10000002',
      spousePersonNumber: member.personNumber,
      teams: {
        employee: [{ id: 'team-2', name: 'City', department: 'US City' }],
        spouse: [],
      },
    });
    const pair = { ...member, partner };

    it('shows both first names, both initials and both teams', () => {
      const { getByText, getByTestId } = renderRow(jest.fn(), pair);
      expect(getByText('Brooke & Ben Butler')).toBeInTheDocument();
      expect(getByText('BB')).toBeInTheDocument();
      expect(getByTestId('person-numbers')).toHaveTextContent(
        'FamilyLife, City',
      );
      expect(getByTestId('person-numbers')).not.toHaveTextContent('Spouse:');
    });

    it('opens the drawer under the combined name', () => {
      const { getByRole } = renderRow(jest.fn(), pair);
      expect(
        getByRole('button', { name: 'View details for Brooke & Ben Butler' }),
      ).toBeInTheDocument();
    });
  });

  describe('quick glance', () => {
    it('renders no chevron without a toggle handler', () => {
      const { queryByRole } = renderRow();
      expect(queryByRole('button', { name: /details for/ })).toHaveAttribute(
        'aria-label',
        'View details for Brooke Butler',
      );
      expect(
        queryByRole('button', { name: 'Show details for Brooke Butler' }),
      ).not.toBeInTheDocument();
    });

    it('toggles from the chevron without opening the drawer', () => {
      const onClick = jest.fn();
      const onToggleExpand = jest.fn();
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <StaffMember
            data={member}
            onClick={onClick}
            onToggleExpand={onToggleExpand}
          />
        </ThemeProvider>,
      );
      const chevron = getByRole('button', {
        name: 'Show details for Brooke Butler',
      });
      expect(chevron).toHaveAttribute('aria-expanded', 'false');

      userEvent.click(chevron);

      expect(onToggleExpand).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('shows the extra details when expanded, in either density', () => {
      const { getByRole, getByTestId, getByText } = render(
        <ThemeProvider theme={theme}>
          <StaffMember
            data={member}
            density={RowDensityEnum.Compact}
            expanded
            onToggleExpand={jest.fn()}
          />
        </ThemeProvider>,
      );
      expect(
        getByRole('button', { name: 'Hide details for Brooke Butler' }),
      ).toHaveAttribute('aria-expanded', 'true');
      const glance = getByTestId('quick-glance');
      expect(glance).toHaveTextContent('Person number10000001');
      expect(glance).toHaveTextContent('DepartmentUS FamilyLife');
      expect(glance).toHaveTextContent('Geographic locationOrlando, FL');
      expect(glance).toHaveTextContent('New Staff Monthly Salary$2,500.00');
      expect(glance).toHaveTextContent('Monthly Gross Salary$4,500.00');
      expect(glance).toHaveTextContent('Tenure6 years');
      expect(glance).toHaveTextContent('Healthcare dependents2');
      expect(glance).toHaveTextContent('Support typeSupported RMO');
      expect(glance).toHaveTextContent('SECASubject to SECA');
      expect(getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('drops the avatar in the compact layout but keeps the accessible name', () => {
    const { queryByText, getByRole, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <StaffMember data={member} density={RowDensityEnum.Compact} />
      </ThemeProvider>,
    );
    expect(queryByText('BB')).not.toBeInTheDocument();
    expect(
      getByRole('button', { name: 'View details for Brooke Butler' }),
    ).toBeInTheDocument();
    expect(getByTestId('person-numbers')).toHaveTextContent(
      '1000000001 · Full time · FamilyLife',
    );
  });

  it('renders the staff account, employment type, and team line', () => {
    const { getByTestId } = renderRow();
    expect(getByTestId('person-numbers')).toHaveTextContent(
      '1000000001 · Full time · FamilyLife',
    );
  });

  it('renders a placeholder when the member has no assignment category', () => {
    const { getByTestId } = renderRow(
      jest.fn(),
      managedStaffMember({ assignmentCategoryGroup: null }),
    );
    expect(getByTestId('person-numbers')).toHaveTextContent('1000000001 · — ·');
  });

  it('joins the names when a member is on several teams', () => {
    const { getByTestId } = renderRow(
      jest.fn(),
      managedStaffMember({
        teams: {
          employee: [
            { id: 'team-1', name: 'Campus', department: null },
            { id: 'team-2', name: 'Cru City', department: null },
          ],
          spouse: [],
        },
      }),
    );
    expect(getByTestId('person-numbers')).toHaveTextContent('Campus, Cru City');
  });

  it('renders a currency-formatted payroll chip for each quarter', () => {
    const { getByText } = renderRow();
    expect(getByText('$4,600.00')).toBeInTheDocument();
    expect(getByText('$3,500.00')).toBeInTheDocument();
    expect(getByText('$2,200.00')).toBeInTheDocument();
    expect(getByText('$4,500.00')).toBeInTheDocument();
  });

  it('labels a quarter payroll started partway through as Partial', () => {
    const { getByText } = renderRow(
      jest.fn(),
      managedStaffMember({
        quarterlyHealth: {
          monthlyGrossSalary: 4500,
          completedQuarters: [],
          startingQuarter: { fiscalYear: 2026, quarter: 3, months: [] },
        },
      }),
    );
    expect(getByText('Partial')).toBeInTheDocument();
  });

  it('renders a dash instead of $0.00 for a quarter with no payroll data', () => {
    const { getByText, queryByText } = renderRow(
      jest.fn(),
      managedStaffMember({
        quarterlyHealth: {
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
        },
      }),
    );

    expect(getByText('-')).toBeInTheDocument();
    expect(queryByText('$0.00')).not.toBeInTheDocument();
    expect(getByText('FQ4 25, no data')).toBeInTheDocument();
  });

  describe('gross salary marker', () => {
    const warning =
      /Monthly Gross Salary \(\$2,000\.00\) is \$500\.00 below the New Staff Monthly Salary \(\$2,500\.00\)/;

    it('flags a Monthly Gross Salary below the New Staff Monthly Salary', async () => {
      const { getByRole, findByRole } = renderRow(
        jest.fn(),
        managedStaffMember({
          newStaffMonthlySalary: 2500,
          quarterlyHealth: { monthlyGrossSalary: 2000, completedQuarters: [] },
        }),
      );

      const marker = getByRole('img', { name: warning });
      // The row is already a button, so the marker is not a second tab stop
      expect(marker).not.toHaveAttribute('tabindex');
      userEvent.hover(marker);
      expect(await findByRole('tooltip')).toHaveTextContent(warning);
    });

    it('announces the warning in the row button name for keyboard users', () => {
      const { getByRole } = renderRow(
        jest.fn(),
        managedStaffMember({
          newStaffMonthlySalary: 2500,
          quarterlyHealth: { monthlyGrossSalary: 2000, completedQuarters: [] },
        }),
      );

      expect(getByRole('button')).toHaveAccessibleName(warning);
    });

    it('shows no marker when the gross salary meets the benchmark', () => {
      const { queryByLabelText } = renderRow();
      expect(
        queryByLabelText(/below the New Staff Monthly Salary/),
      ).not.toBeInTheDocument();
    });

    it('shows no marker when a benchmark is missing', () => {
      const { queryByLabelText } = renderRow(
        jest.fn(),
        managedStaffMember({
          newStaffMonthlySalary: null,
          quarterlyHealth: { monthlyGrossSalary: 2000, completedQuarters: [] },
        }),
      );
      expect(
        queryByLabelText(/below the New Staff Monthly Salary/),
      ).not.toBeInTheDocument();
    });
  });

  it('exposes an accessible button with a descriptive label', () => {
    const { getByRole } = renderRow();
    expect(
      getByRole('button', { name: 'View details for Brooke Butler' }),
    ).toBeInTheDocument();
  });

  it('calls onClick when the card is clicked', async () => {
    const { onClick, getByRole } = renderRow();
    userEvent.click(
      getByRole('button', { name: 'View details for Brooke Butler' }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders the card as a real button so the keyboard can activate it', () => {
    const { getByRole } = renderRow();
    expect(
      getByRole('button', { name: 'View details for Brooke Butler' }),
    ).toHaveProperty('tagName', 'BUTTON');
  });
});
