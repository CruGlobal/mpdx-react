import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import { getStyleAtWidth, phoneWidth } from '__tests__/util/styleAtWidth';
import { MpdCapHealthEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { RowDensityEnum } from '../MpdSupervisorReportContext';
import { ManagedStaffMember } from '../helpers';
import { managedStaffMember } from '../mpdSupervisorReportMocks';
import { StaffMember } from './StaffMember';

const renderRow = (
  overrides: Partial<ManagedStaffMember>,
  density = RowDensityEnum.Comfortable,
) =>
  render(
    <ThemeProvider theme={theme}>
      <StaffMember
        data={managedStaffMember({
          firstName: 'Brooke',
          lastName: 'Butler',
          ...overrides,
        })}
        density={density}
        onClick={jest.fn()}
      />
    </ThemeProvider>,
  );

// MPDX-10323
describe('StaffMember CAP health badge', () => {
  it.each([RowDensityEnum.Comfortable, RowDensityEnum.Compact])(
    'sits on the name line in %s rows',
    (density) => {
      const { getByText } = renderRow(
        { capHealth: MpdCapHealthEnum.NeedsAttention, percentOfCap: 41 },
        density,
      );

      const nameLine = getByText('Brooke Butler').parentElement as HTMLElement;
      expect(
        within(nameLine).getByTestId('cap-health-badge'),
      ).toHaveTextContent('Needs Attention');
    },
  );

  // The row's aria-label replaces its contents, so it must name the grade too
  it('names the grade in the row button for screen readers', () => {
    const { getByRole } = renderRow({
      capHealth: MpdCapHealthEnum.NeedsAttention,
      percentOfCap: 41,
    });

    expect(
      getByRole('button', {
        name: 'View details for Brooke Butler, Needs Attention',
      }),
    ).toBeInTheDocument();
  });

  it('names the grade and the gross salary warning together', () => {
    const { getByRole } = renderRow({
      capHealth: MpdCapHealthEnum.NeedsAttention,
      percentOfCap: 41,
      newStaffMonthlySalary: 2500,
      quarterlyHealth: { monthlyGrossSalary: 2000, completedQuarters: [] },
    });

    expect(getByRole('button')).toHaveAccessibleName(
      /^View details for Brooke Butler, Needs Attention\. Monthly Gross Salary/,
    );
  });

  it('is left off for staff with no Personal CAP', () => {
    const { queryByTestId } = renderRow({
      capHealth: null,
      percentOfCap: null,
    });

    expect(queryByTestId('cap-health-badge')).not.toBeInTheDocument();
  });

  // MPDX-10302 fit each row to a 390px phone; a long name must push the badge
  // to its own line rather than past the card's edge.
  it('lets the badge wrap under a long name on a phone', () => {
    const { getByText } = renderRow({
      capHealth: MpdCapHealthEnum.Healthy,
      percentOfCap: 72,
    });

    const nameLine = getByText('Brooke Butler').parentElement as HTMLElement;
    expect(getStyleAtWidth(nameLine, 'flex-wrap', phoneWidth)).toBe('wrap');
  });
});
