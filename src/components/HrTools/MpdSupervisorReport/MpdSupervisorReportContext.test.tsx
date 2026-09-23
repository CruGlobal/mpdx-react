import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MpdAssignmentCategoryGroupEnum } from 'src/graphql/types.generated';
import { MpdSupervisorReportQuickFilterEnum } from './Filters/mpdSupervisorReportFilters';
import { ManagedStaffQuery } from './ManagedStaff.generated';
import {
  MpdSupervisorReportProvider,
  Panel,
  useMpdSupervisorReport,
} from './MpdSupervisorReportContext';
import { StaffDetailTabEnum } from './StaffDetailsTabs/StaffDetailTab';
import { ManagedStaffMember } from './helpers';
import {
  managedStaffMember,
  managedStaffMock,
} from './mpdSupervisorReportMocks';

const mutationSpy = jest.fn();
const sampleMember = managedStaffMember();

interface ConsumerResult {
  isOpen: boolean;
  selectedMember: ManagedStaffMember | undefined;
  openMember: (member: ManagedStaffMember) => void;
  updateSelectedMember: (
    personNumber: string,
    patch: Partial<ManagedStaffMember>,
  ) => void;
  closePanel: () => void;
  search: string;
  setSearch: (v: string) => void;
  team: string | null;
  setTeam: (v: string | null) => void;
  department: string | null;
  setDepartment: (v: string | null) => void;
  employmentType: MpdAssignmentCategoryGroupEnum | null;
  setEmploymentType: (v: MpdAssignmentCategoryGroupEnum | null) => void;
  activeQuickFilter: MpdSupervisorReportQuickFilterEnum;
  setActiveQuickFilter: (v: MpdSupervisorReportQuickFilterEnum) => void;
  loadMore: () => void;
}

let consumerResult: ConsumerResult;

const Consumer: React.FC = () => {
  const ctx = useMpdSupervisorReport();
  consumerResult = ctx;
  return (
    <div>
      <span data-testid="isOpen">{String(ctx.isOpen)}</span>
      <span data-testid="memberName">
        {ctx.selectedMember?.lastName ?? 'none'}
      </span>
      <span data-testid="search">{ctx.search}</span>
      <span data-testid="team">{ctx.team}</span>
      <span data-testid="department">{ctx.department}</span>
      <span data-testid="employmentType">{ctx.employmentType}</span>
      <span data-testid="activeQuickFilter">{ctx.activeQuickFilter}</span>
    </div>
  );
};

const renderInProvider = (
  children: React.ReactNode,
  router: React.ComponentProps<typeof TestRouter>['router'] = {},
  managedStaff: ManagedStaffQuery = managedStaffMock([sampleMember]),
) =>
  render(
    <TestRouter router={router}>
      <GqlMockedProvider<{ ManagedStaff: ManagedStaffQuery }>
        mocks={{ ManagedStaff: managedStaff }}
        onCall={mutationSpy}
      >
        <MpdSupervisorReportProvider>{children}</MpdSupervisorReportProvider>
      </GqlMockedProvider>
    </TestRouter>,
  );

const renderConsumer = () => renderInProvider(<Consumer />);

describe('MpdSupervisorReportContext', () => {
  it('starts with isOpen false and no selected member', () => {
    const { getByTestId } = renderConsumer();
    expect(getByTestId('isOpen').textContent).toBe('false');
    expect(getByTestId('memberName').textContent).toBe('none');
  });

  it('openMember sets the selected member and isOpen to true', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.openMember(sampleMember);
    });
    expect(getByTestId('isOpen').textContent).toBe('true');
    expect(getByTestId('memberName').textContent).toBe('Smith');
  });

  it('closePanel clears the selected member and sets isOpen to false', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.openMember(sampleMember);
    });
    expect(getByTestId('isOpen').textContent).toBe('true');
    act(() => {
      consumerResult.closePanel();
    });
    expect(getByTestId('isOpen').textContent).toBe('false');
    expect(getByTestId('memberName').textContent).toBe('none');
  });

  it('throws an error when used outside the provider', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    expect(() => render(<Consumer />)).toThrow(
      'useMpdSupervisorReport must be used within a MpdSupervisorReportProvider',
    );
    consoleError.mockRestore();
  });

  // New filter state tests
  it('starts with empty search', () => {
    const { getByTestId } = renderConsumer();
    expect(getByTestId('search').textContent).toBe('');
  });

  it('starts with no team or department', () => {
    const { getByTestId } = renderConsumer();
    expect(getByTestId('team').textContent).toBe('');
    expect(getByTestId('department').textContent).toBe('');
  });

  it('starts with no employmentType', () => {
    const { getByTestId } = renderConsumer();
    expect(getByTestId('employmentType').textContent).toBe('');
    expect(consumerResult.employmentType).toBeNull();
  });

  it('starts with activeQuickFilter=allPeople', () => {
    const { getByTestId } = renderConsumer();
    expect(getByTestId('activeQuickFilter').textContent).toBe(
      MpdSupervisorReportQuickFilterEnum.AllPeople,
    );
  });

  it('setSearch updates the search value', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.setSearch('John');
    });
    expect(getByTestId('search').textContent).toBe('John');
  });

  it('setTeam updates the team value', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.setTeam('Central Team');
    });
    expect(getByTestId('team').textContent).toBe('Central Team');
  });

  it('setDepartment updates the department value', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.setDepartment('Cru Military');
    });
    expect(getByTestId('department').textContent).toBe('Cru Military');
  });

  it('setEmploymentType updates the employmentType value', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.setEmploymentType(MpdAssignmentCategoryGroupEnum.FullTime);
    });
    expect(getByTestId('employmentType').textContent).toBe(
      MpdAssignmentCategoryGroupEnum.FullTime,
    );
  });

  it('setEmploymentType clears the employmentType value', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.setEmploymentType(MpdAssignmentCategoryGroupEnum.FullTime);
    });
    act(() => {
      consumerResult.setEmploymentType(null);
    });
    expect(getByTestId('employmentType').textContent).toBe('');
  });

  it('setActiveQuickFilter updates the activeQuickFilter value', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.setActiveQuickFilter(
        MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative,
      );
    });
    expect(getByTestId('activeQuickFilter').textContent).toBe(
      MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative,
    );
  });
});

describe('managed staff query variables', () => {
  it('omits teamNames and departments until a filter is chosen', async () => {
    renderConsumer();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        teamNames: null,
        departments: null,
      }),
    );
  });

  it('sends the chosen team as teamNames', async () => {
    renderConsumer();
    act(() => {
      consumerResult.setTeam('Central Team');
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        teamNames: ['Central Team'],
      }),
    );
  });

  it('sends the chosen department as departments', async () => {
    renderConsumer();
    act(() => {
      consumerResult.setDepartment('Cru Military');
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        departments: ['Cru Military'],
      }),
    );
  });

  it('sends both when a team and a department are chosen', async () => {
    renderConsumer();
    act(() => {
      consumerResult.setTeam('Central Team');
      consumerResult.setDepartment('Cru Military');
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        teamNames: ['Central Team'],
        departments: ['Cru Military'],
      }),
    );
  });

  it('sends a null assignmentCategoryGroup until an employment type is chosen', async () => {
    renderConsumer();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        assignmentCategoryGroup: null,
      }),
    );
  });

  it('sends the chosen employment type as assignmentCategoryGroup', async () => {
    renderConsumer();
    act(() => {
      consumerResult.setEmploymentType(MpdAssignmentCategoryGroupEnum.PartTime);
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        assignmentCategoryGroup: MpdAssignmentCategoryGroupEnum.PartTime,
      }),
    );
  });

  it('omits both health flags while All people is selected', async () => {
    renderConsumer();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        negativeLastMonth: null,
        negativeThreeMonths: null,
      }),
    );
  });

  it('sends negativeLastMonth for the negative last month filter', async () => {
    renderConsumer();
    act(() => {
      consumerResult.setActiveQuickFilter(
        MpdSupervisorReportQuickFilterEnum.NegativeLastMonth,
      );
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        negativeLastMonth: true,
        negativeThreeMonths: null,
      }),
    );
  });

  it('sends negativeThreeMonths for the three months negative filter', async () => {
    renderConsumer();
    act(() => {
      consumerResult.setActiveQuickFilter(
        MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative,
      );
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        negativeLastMonth: null,
        negativeThreeMonths: true,
      }),
    );
  });
});

describe('loadMore', () => {
  const withNextPage: ManagedStaffQuery = {
    managedStaff: {
      nodes: [sampleMember],
      pageInfo: { endCursor: 'cursor-1', hasNextPage: true },
      totalCount: 2,
    },
  };

  it('fetches the next page when asked before the first page arrives', async () => {
    renderInProvider(<Consumer />, {}, withNextPage);

    act(() => {
      consumerResult.loadMore();
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        after: 'cursor-1',
      }),
    );
  });

  it('does not fetch when there is no next page', async () => {
    renderInProvider(<Consumer />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        teamNames: null,
      }),
    );
    act(() => {
      consumerResult.loadMore();
    });

    await waitFor(() =>
      expect(mutationSpy).not.toHaveGraphqlOperation('ManagedStaff', {
        after: '1',
      }),
    );
  });
});

describe('updateSelectedMember', () => {
  it('patches the open member', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.openMember(sampleMember);
    });
    act(() => {
      consumerResult.updateSelectedMember('10000001', { lastName: 'Patched' });
    });
    expect(getByTestId('memberName').textContent).toBe('Patched');
  });

  it('ignores a patch for another staff member', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.openMember(sampleMember);
    });
    act(() => {
      consumerResult.updateSelectedMember('99999999', { lastName: 'Patched' });
    });
    expect(getByTestId('memberName').textContent).toBe('Smith');
  });

  it('does nothing when the panel is closed', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.updateSelectedMember('10000001', { lastName: 'Patched' });
    });
    expect(getByTestId('isOpen').textContent).toBe('false');
    expect(getByTestId('memberName').textContent).toBe('none');
  });
});

describe('Panel enum', () => {
  it('has correct Navigation and Filters values', () => {
    expect(Panel.Navigation).toBe('Navigation');
    expect(Panel.Filters).toBe('Filters');
  });
});

const TabConsumer: React.FC = () => {
  const { selectedTabKey } = useMpdSupervisorReport();
  return <span data-testid="tab">{selectedTabKey}</span>;
};

const renderWithTab = (tab?: string) =>
  renderInProvider(<TabConsumer />, { query: tab ? { tab } : {} });

describe('MpdSupervisorReportContext — selectedTabKey from URL', () => {
  it('defaults to MonthlySummary when no ?tab= is present', () => {
    const { getByTestId } = renderWithTab();
    expect(getByTestId('tab').textContent).toBe(
      StaffDetailTabEnum.MonthlySummary,
    );
  });

  it('seeds selectedTabKey from a valid ?tab= query param', () => {
    const { getByTestId } = renderWithTab('Payroll');
    expect(getByTestId('tab').textContent).toBe(StaffDetailTabEnum.Payroll);
  });

  it('falls back to MonthlySummary for an unknown ?tab= value', () => {
    const { getByTestId } = renderWithTab('not-a-real-tab');
    expect(getByTestId('tab').textContent).toBe(
      StaffDetailTabEnum.MonthlySummary,
    );
  });

  it('uses the first value when ?tab= is an array', () => {
    const { getByTestId } = renderInProvider(<TabConsumer />, {
      query: { tab: ['Payroll', 'Quarterly'] },
    });
    expect(getByTestId('tab').textContent).toBe(StaffDetailTabEnum.Payroll);
  });
});

const TabSwitcher: React.FC = () => {
  const { selectedTabKey, handleTabChange } = useMpdSupervisorReport();
  return (
    <button
      data-testid="tab"
      onClick={(event) => handleTabChange(event, StaffDetailTabEnum.Payroll)}
    >
      {selectedTabKey}
    </button>
  );
};

describe('MpdSupervisorReportContext — selectedTabKey to URL', () => {
  it('syncs the selected tab back to the URL on change', async () => {
    const replaceState = jest.spyOn(window.history, 'replaceState');
    const { getByTestId } = renderInProvider(<TabSwitcher />, {
      query: { accountListId: 'account-list-1' },
    });

    await act(async () => {
      getByTestId('tab').click();
    });

    expect(replaceState).toHaveBeenCalledTimes(1);
    expect(replaceState.mock.lastCall?.[2]).toContain(
      `tab=${StaffDetailTabEnum.Payroll}`,
    );
    replaceState.mockRestore();
  });

  it('does not route through Next when syncing the tab', async () => {
    const replace = jest.fn();
    const push = jest.fn();
    const { getByTestId } = renderInProvider(<TabSwitcher />, {
      query: { accountListId: 'account-list-1' },
      replace,
      push,
    });

    await act(async () => {
      getByTestId('tab').click();
    });

    expect(replace).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
