import React from 'react';
import { ApolloError } from '@apollo/client';
import { act, render, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MpdAssignmentCategoryGroupEnum } from 'src/graphql/types.generated';
import { MpdSupervisorReportQuickFilterEnum } from './Filters/mpdSupervisorReportFilters';
import {
  ManagedStaffQuery,
  ManagedStaffQueryVariables,
} from './ManagedStaff.generated';
import {
  FilterRequired,
  MpdSupervisorReportProvider,
  Panel,
  RowDensityEnum,
  filterRequiredFromError,
  rowDensityStorageKey,
  useMpdSupervisorReport,
} from './MpdSupervisorReportContext';
import { StaffDetailTabEnum } from './StaffDetailsTabs/StaffDetailTab';
import { ManagedStaffMember, StaffRow } from './helpers';
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
  legendOpen: boolean;
  openLegend: () => void;
  closeLegend: () => void;
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
  activeFilterCount: number;
  clearFilters: () => void;
  filterRequired: FilterRequired | null;
  staffError: ApolloError | undefined;
  loadMoreError: ApolloError | undefined;
  staffMembers: StaffRow[];
  loadedCount: number;
  staffComplete: boolean;
  queryVariables: ManagedStaffQueryVariables;
  expandedRows: ReadonlySet<string>;
  toggleRow: (personNumber: string) => void;
  rowDensity: RowDensityEnum;
  setRowDensity: (v: RowDensityEnum) => void;
  loadMore: () => void;
}

let consumerResult: ConsumerResult;

const Consumer: React.FC = () => {
  const ctx = useMpdSupervisorReport();
  consumerResult = ctx;
  return (
    <div>
      <span data-testid="isOpen">{String(ctx.isOpen)}</span>
      <span data-testid="legendOpen">{String(ctx.legendOpen)}</span>
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
  /** Overrides the default mocks, e.g. to make the query throw. */
  mocks: ApolloErgonoMockMap = {},
) =>
  render(
    <TestRouter router={router}>
      <GqlMockedProvider<{ ManagedStaff: ManagedStaffQuery }>
        mocks={{ ManagedStaff: managedStaff, ...mocks } as ApolloErgonoMockMap}
        onCall={mutationSpy}
      >
        <MpdSupervisorReportProvider>{children}</MpdSupervisorReportProvider>
      </GqlMockedProvider>
    </TestRouter>,
  );

const renderConsumer = (mocks: ApolloErgonoMockMap = {}) =>
  renderInProvider(<Consumer />, {}, undefined, mocks);

const filterGuard = (filtered: boolean): ApolloErgonoMockMap => ({
  ManagedStaff: {
    managedStaff: () => {
      throw new GraphQLError('228 staff are in reach', {
        extensions: { code: 'FILTER_REQUIRED', count: 228, filtered },
      });
    },
  },
});

describe('filterRequiredFromError', () => {
  const guard = (extensions: Record<string, unknown>) =>
    new ApolloError({
      graphQLErrors: [new GraphQLError('too many', { extensions })],
    });

  it('parses count and filtered from a FILTER_REQUIRED error', () => {
    expect(
      filterRequiredFromError(
        guard({ code: 'FILTER_REQUIRED', count: 228, filtered: true }),
      ),
    ).toEqual({ count: 228, filtered: true });
  });

  it('falls back to 0 / unfiltered when the extensions are malformed', () => {
    expect(filterRequiredFromError(guard({ code: 'FILTER_REQUIRED' }))).toEqual(
      { count: 0, filtered: false },
    );
  });

  it('ignores other errors', () => {
    expect(filterRequiredFromError(guard({ code: 'NOT_FOUND' }))).toBeNull();
    expect(filterRequiredFromError(undefined)).toBeNull();
  });
});

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

  it('keeps the legend and the selected member mutually exclusive', () => {
    const { getByTestId } = renderConsumer();
    expect(getByTestId('legendOpen').textContent).toBe('false');

    act(() => {
      consumerResult.openMember(sampleMember);
    });
    act(() => {
      consumerResult.openLegend();
    });
    expect(getByTestId('legendOpen').textContent).toBe('true');
    expect(getByTestId('isOpen').textContent).toBe('false');

    act(() => {
      consumerResult.openMember(sampleMember);
    });
    expect(getByTestId('legendOpen').textContent).toBe('false');
    expect(getByTestId('isOpen').textContent).toBe('true');

    act(() => {
      consumerResult.openLegend();
    });
    act(() => {
      consumerResult.closeLegend();
    });
    expect(getByTestId('legendOpen').textContent).toBe('false');
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

  describe('row density', () => {
    afterEach(() => {
      window.localStorage.clear();
    });

    it('defaults to comfortable rows and persists a change', () => {
      renderConsumer();
      expect(consumerResult.rowDensity).toBe(RowDensityEnum.Comfortable);

      act(() => {
        consumerResult.setRowDensity(RowDensityEnum.Compact);
      });

      expect(consumerResult.rowDensity).toBe(RowDensityEnum.Compact);
      expect(window.localStorage.getItem(rowDensityStorageKey)).toBe(
        '"compact"',
      );
    });

    it('ignores a stored density it does not recognise', () => {
      window.localStorage.setItem(rowDensityStorageKey, '"dense"');
      renderConsumer();
      expect(consumerResult.rowDensity).toBe(RowDensityEnum.Comfortable);
    });
  });

  it('counts the panel filters but not the search', () => {
    renderConsumer();
    expect(consumerResult.activeFilterCount).toBe(0);

    act(() => {
      consumerResult.setSearch('Jo');
      consumerResult.setTeam('Central Team');
      consumerResult.setDepartment('Cru Military');
      consumerResult.setEmploymentType(MpdAssignmentCategoryGroupEnum.FullTime);
      consumerResult.setActiveQuickFilter(
        MpdSupervisorReportQuickFilterEnum.NegativeLastMonth,
      );
    });

    expect(consumerResult.activeFilterCount).toBe(4);
  });

  it('clearFilters resets the search and every panel filter', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.setSearch('Jo');
      consumerResult.setTeam('Central Team');
      consumerResult.setDepartment('Cru Military');
      consumerResult.setEmploymentType(MpdAssignmentCategoryGroupEnum.FullTime);
      consumerResult.setActiveQuickFilter(
        MpdSupervisorReportQuickFilterEnum.NegativeLastMonth,
      );
    });

    act(() => {
      consumerResult.clearFilters();
    });

    expect(getByTestId('search').textContent).toBe('');
    expect(getByTestId('team').textContent).toBe('');
    expect(getByTestId('department').textContent).toBe('');
    expect(getByTestId('employmentType').textContent).toBe('');
    expect(getByTestId('activeQuickFilter').textContent).toBe(
      MpdSupervisorReportQuickFilterEnum.AllPeople,
    );
    expect(consumerResult.activeFilterCount).toBe(0);
  });
});

describe('rows', () => {
  const john = managedStaffMember({
    personNumber: '1',
    spousePersonNumber: '2',
  });
  const jane = managedStaffMember({
    firstName: 'Jane',
    personNumber: '2',
    spousePersonNumber: '1',
  });

  it('asks for the whole result in one page of 100', async () => {
    renderConsumer();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        first: 100,
      }),
    );
  });

  it('merges a spouse pair into one row and counts both people', async () => {
    renderInProvider(<Consumer />, {}, managedStaffMock([john, jane]));

    await waitFor(() => expect(consumerResult.staffMembers).toHaveLength(1));
    expect(consumerResult.staffMembers[0].partner?.personNumber).toBe('2');
    expect(consumerResult.loadedCount).toBe(2);
  });

  it('loads every page by itself and reports when the result is complete', async () => {
    const page1 = managedStaffMock([john]);
    page1.managedStaff.pageInfo = { endCursor: 'cursor-1', hasNextPage: true };
    const page2 = managedStaffMock([
      managedStaffMember({
        firstName: 'Zoe',
        personNumber: '9',
        staffAccountId: 'z',
      }),
    ]);
    renderConsumer({
      ManagedStaff: {
        managedStaff: (_root: unknown, args: { after?: string | null }) =>
          args.after ? page2.managedStaff : page1.managedStaff,
      },
    });

    await waitFor(() => expect(consumerResult.staffComplete).toBe(true));
    expect(
      consumerResult.staffMembers.map(({ firstName }) => firstName),
    ).toEqual(['John', 'Zoe']);
  });

  it('exposes the variables the roster query runs with', async () => {
    renderConsumer();
    act(() => {
      consumerResult.setTeam('Central Team');
    });
    await waitFor(() =>
      expect(consumerResult.queryVariables).toMatchObject({
        first: 100,
        teamNames: ['Central Team'],
      }),
    );
  });

  it('toggles a row open and closed', () => {
    renderConsumer();
    expect(consumerResult.expandedRows.has('1')).toBe(false);

    act(() => {
      consumerResult.toggleRow('1');
    });
    expect(consumerResult.expandedRows.has('1')).toBe(true);

    act(() => {
      consumerResult.toggleRow('1');
    });
    expect(consumerResult.expandedRows.has('1')).toBe(false);
  });
});

describe('managed staff query variables', () => {
  it('exposes the FILTER_REQUIRED guard instead of an error', async () => {
    renderConsumer(filterGuard(false));

    await waitFor(() =>
      expect(consumerResult.filterRequired).toEqual({
        count: 228,
        filtered: false,
      }),
    );
    expect(consumerResult.staffError).toBeUndefined();
  });

  it('reports other query failures as staffError', async () => {
    renderConsumer({
      ManagedStaff: {
        managedStaff: () => {
          throw new Error('Not authorized');
        },
      },
    });

    await waitFor(() =>
      expect(consumerResult.staffError?.message).toBe('Not authorized'),
    );
    expect(consumerResult.filterRequired).toBeNull();
  });

  it('asks the client not to toast only the filter guard', async () => {
    renderConsumer();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {}),
    );
    const call = mutationSpy.mock.calls.find(
      ([{ operation }]) => operation.operationName === 'ManagedStaff',
    );
    const context = call?.[0].operation.getContext();
    expect(context.suppressErrorCodes).toEqual(['FILTER_REQUIRED']);
    expect(context.suppressErrors).toBeUndefined();
  });

  describe('a failed load-more page', () => {
    const firstPage = managedStaffMock([sampleMember]);
    firstPage.managedStaff.pageInfo = {
      endCursor: 'cursor-1',
      hasNextPage: true,
    };
    // The first page loads; every page after a cursor fails
    const failingSecondPage: ApolloErgonoMockMap = {
      ManagedStaff: {
        managedStaff: (_root: unknown, args: { after?: string | null }) => {
          if (args.after) {
            throw new Error('Page failed');
          }
          return firstPage.managedStaff;
        },
      },
    };
    const pageRequests = () =>
      mutationSpy.mock.calls.filter(
        ([{ operation }]) =>
          operation.operationName === 'ManagedStaff' &&
          operation.variables.after === 'cursor-1',
      );

    it('asks for the rest of the result by itself, keeps the loaded rows and exposes the failure', async () => {
      renderConsumer(failingSecondPage);

      await waitFor(() =>
        expect(consumerResult.loadMoreError?.message).toBe('Page failed'),
      );
      expect(consumerResult.staffMembers).toHaveLength(1);
      expect(consumerResult.staffError).toBeUndefined();
      expect(consumerResult.staffComplete).toBe(false);
      // A failed page is not retried in a loop
      await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
      expect(pageRequests()).toHaveLength(1);
    });

    it('retries the same cursor when asked', async () => {
      renderConsumer(failingSecondPage);
      await waitFor(() => expect(consumerResult.loadMoreError).toBeDefined());
      const before = pageRequests().length;

      act(() => {
        consumerResult.loadMore();
      });

      await waitFor(() => expect(pageRequests().length).toBe(before + 1));
    });

    it('forgets the failure when the filters change', async () => {
      renderConsumer(failingSecondPage);
      await waitFor(() => expect(consumerResult.loadMoreError).toBeDefined());

      act(() => {
        consumerResult.setTeam('Central Team');
      });

      await waitFor(() => expect(consumerResult.loadMoreError).toBeUndefined());
    });
  });

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
