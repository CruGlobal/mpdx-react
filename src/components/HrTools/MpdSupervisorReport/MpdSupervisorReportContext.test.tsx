import React from 'react';
import { act, render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import {
  ALL_TEAMS,
  MpdSupervisorReportEmploymentTypeEnum,
  MpdSupervisorReportQuickFilterEnum,
} from './Filters/mpdSupervisorReportFilters';
import {
  MpdSupervisorReportProvider,
  Panel,
  useMpdSupervisorReport,
} from './MpdSupervisorReportContext';
import { StaffDetailTabEnum } from './StaffDetailsTabs/StaffDetailTab';
import { ManagedStaffMember } from './helpers';
import { managedStaffMember } from './mpdSupervisorReportMocks';

const sampleMember = managedStaffMember();

interface ConsumerResult {
  isOpen: boolean;
  selectedMember: ManagedStaffMember | undefined;
  openMember: (member: ManagedStaffMember) => void;
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

const renderConsumer = () =>
  render(
    <TestRouter>
      <MpdSupervisorReportProvider>
        <Consumer />
      </MpdSupervisorReportProvider>
    </TestRouter>,
  );

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
  render(
    <TestRouter router={{ query: tab ? { tab } : {} }}>
      <MpdSupervisorReportProvider>
        <TabConsumer />
      </MpdSupervisorReportProvider>
    </TestRouter>,
  );

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
    const { getByTestId } = render(
      <TestRouter router={{ query: { tab: ['Payroll', 'Quarterly'] } }}>
        <MpdSupervisorReportProvider>
          <TabConsumer />
        </MpdSupervisorReportProvider>
      </TestRouter>,
    );
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
    const { getByTestId } = render(
      <TestRouter router={{ query: { accountListId: 'account-list-1' } }}>
        <MpdSupervisorReportProvider>
          <TabSwitcher />
        </MpdSupervisorReportProvider>
      </TestRouter>,
    );

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
    const { getByTestId } = render(
      <TestRouter
        router={{ query: { accountListId: 'account-list-1' }, replace, push }}
      >
        <MpdSupervisorReportProvider>
          <TabSwitcher />
        </MpdSupervisorReportProvider>
      </TestRouter>,
    );

    await act(async () => {
      getByTestId('tab').click();
    });

    expect(replace).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
