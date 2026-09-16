import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  ALL_TEAMS,
  MpdSupervisorReportEmploymentTypeEnum,
  MpdSupervisorReportQuickFilterEnum,
} from './Filters/mpdSupervisorReportFilters';
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
  team: string;
  setTeam: (v: string) => void;
  employmentType: MpdSupervisorReportEmploymentTypeEnum;
  setEmploymentType: (v: MpdSupervisorReportEmploymentTypeEnum) => void;
  activeQuickFilter: MpdSupervisorReportQuickFilterEnum;
  setActiveQuickFilter: (v: MpdSupervisorReportQuickFilterEnum) => void;
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
      <span data-testid="employmentType">{ctx.employmentType}</span>
      <span data-testid="activeQuickFilter">{ctx.activeQuickFilter}</span>
    </div>
  );
};

const renderInProvider = (
  children: React.ReactNode,
  router: React.ComponentProps<typeof TestRouter>['router'] = {},
) =>
  render(
    <TestRouter router={router}>
      <GqlMockedProvider<{ ManagedStaff: ManagedStaffQuery }>
        mocks={{ ManagedStaff: managedStaffMock([sampleMember]) }}
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

  it('starts with team=all', () => {
    const { getByTestId } = renderConsumer();
    expect(getByTestId('team').textContent).toBe(ALL_TEAMS);
  });

  it('starts with employmentType=all', () => {
    const { getByTestId } = renderConsumer();
    expect(getByTestId('employmentType').textContent).toBe(
      MpdSupervisorReportEmploymentTypeEnum.All,
    );
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
      consumerResult.setTeam('team-1');
    });
    expect(getByTestId('team').textContent).toBe('team-1');
  });

  it('setEmploymentType updates the employmentType value', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.setEmploymentType(
        MpdSupervisorReportEmploymentTypeEnum.FullTime,
      );
    });
    expect(getByTestId('employmentType').textContent).toBe(
      MpdSupervisorReportEmploymentTypeEnum.FullTime,
    );
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
  it('omits teamIds until a team is chosen', async () => {
    renderConsumer();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        teamIds: null,
      }),
    );
  });

  it('sends the chosen team as teamIds', async () => {
    renderConsumer();
    act(() => {
      consumerResult.setTeam('team-1');
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        teamIds: ['team-1'],
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
