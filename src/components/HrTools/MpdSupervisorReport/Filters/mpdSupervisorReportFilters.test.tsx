import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { AppliedFilters } from '../ListStates/AppliedFilters';
import { MpdSupervisorReportProvider } from '../MpdSupervisorReportContext';
import { TeamSummary } from '../TeamSummary/TeamSummary';
import { managedStaffTeamsMock } from '../mpdSupervisorReportMocks';
import { MpdSupervisorReportFilterPanel } from './MpdSupervisorReportFilterPanel';
import {
  MpdSupervisorReportQuickFilterEnum,
  quickFilterVariables,
} from './mpdSupervisorReportFilters';

const noFlags = {
  negativeLastMonth: null,
  negativeThreeMonths: null,
  negativeThreeMonthsInPastYear: null,
  expensesOverIncomeThreeMonths: null,
  belowNewStaffMonthlySalary: null,
};

describe('quickFilterVariables', () => {
  it('sends no flag for All people', () => {
    expect(
      quickFilterVariables(MpdSupervisorReportQuickFilterEnum.AllPeople),
    ).toEqual(noFlags);
  });

  it.each([
    [MpdSupervisorReportQuickFilterEnum.NegativeLastMonth, 'negativeLastMonth'],
    [
      MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative,
      'negativeThreeMonths',
    ],
    [
      MpdSupervisorReportQuickFilterEnum.ThreeMonthsInPastYearNegative,
      'negativeThreeMonthsInPastYear',
    ],
    [
      MpdSupervisorReportQuickFilterEnum.ThreeMonthsSpendingOverIncome,
      'expensesOverIncomeThreeMonths',
    ],
    [
      MpdSupervisorReportQuickFilterEnum.BelowNewStaffMonthlySalary,
      'belowNewStaffMonthlySalary',
    ],
  ])('sends only %s as %s', (id, flag) => {
    expect(quickFilterVariables(id)).toEqual({ ...noFlags, [flag]: true });
  });
});

describe('Below New Staff Monthly Salary chip', () => {
  const chipName = 'Below New Staff Monthly Salary';
  const mutationSpy = jest.fn();

  const renderPanel = () =>
    render(
      <TestRouter>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider
            mocks={{
              // Two teams, so the team summary loads and its variables can be checked
              ManagedStaffTeams: managedStaffTeamsMock([
                { name: 'Campus', departments: ['US Campus'] },
                { name: 'City', departments: ['US City'] },
              ]),
            }}
            onCall={mutationSpy}
          >
            <MpdSupervisorReportProvider>
              <AppliedFilters />
              <MpdSupervisorReportFilterPanel onClose={jest.fn()} />
              <TeamSummary />
            </MpdSupervisorReportProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );

  it('explains itself in a tooltip', async () => {
    const { getByRole, findByRole } = renderPanel();
    await findByRole('combobox', { name: 'Team' });

    userEvent.hover(getByRole('button', { name: chipName }));

    expect(await findByRole('tooltip')).toHaveTextContent(
      'Staff whose newest quarter is red: their average monthly payroll in the last completed quarter was below their New Staff Monthly Salary.',
    );
  });

  it('asks the API for only its own flag', async () => {
    const { getByRole } = renderPanel();

    userEvent.click(getByRole('button', { name: chipName }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        ...noFlags,
        belowNewStaffMonthlySalary: true,
      }),
    );
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaffTeamSummary', {
        belowNewStaffMonthlySalary: true,
      }),
    );
  });

  it('shows as an applied filter that removes itself', async () => {
    const { getByRole, queryByRole, findByRole } = renderPanel();
    await findByRole('combobox', { name: 'Team' });

    userEvent.click(getByRole('button', { name: chipName }));
    const chips = getByRole('list', { name: 'Applied filters' });
    expect(chips).toHaveTextContent(chipName);

    userEvent.click(
      within(chips).getByRole('button', { name: `Remove ${chipName}` }),
    );
    expect(
      queryByRole('list', { name: 'Applied filters' }),
    ).not.toBeInTheDocument();
  });
});
