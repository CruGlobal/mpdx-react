import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ApolloError } from '@apollo/client';
import { MpdAssignmentCategoryGroupEnum } from 'src/graphql/types.generated';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import { MpdSupervisorReportQuickFilterEnum } from './Filters/mpdSupervisorReportFilters';
import { useManagedStaffQuery } from './ManagedStaff.generated';
import { StaffDetailTabEnum } from './StaffDetailsTabs/StaffDetailTab';
import { ManagedStaffMember } from './helpers';

export enum Panel {
  Navigation = 'Navigation',
  Filters = 'Filters',
}

const searchDebounceMs = 500;
const pageSize = 25;

/**
 * The API refuses to grade more than its row cap in one report and answers
 * with a FILTER_REQUIRED error carrying how many staff matched and whether
 * any filter was already applied. It is guidance, not a failure.
 */
export interface FilterRequired {
  count: number;
  /** Whether the caller had already narrowed the report */
  filtered: boolean;
}

export const filterRequiredFromError = (
  error: ApolloError | undefined,
): FilterRequired | null => {
  const graphQLError = error?.graphQLErrors.find(
    ({ extensions }) => extensions?.code === 'FILTER_REQUIRED',
  );
  if (!graphQLError) {
    return null;
  }
  const { count, filtered } = graphQLError.extensions ?? {};
  return {
    count: typeof count === 'number' ? count : 0,
    filtered: filtered === true,
  };
};

export interface MpdSupervisorReportContextValue {
  selectedMember: ManagedStaffMember | undefined;
  isOpen: boolean;
  openMember: (member: ManagedStaffMember) => void;
  updateSelectedMember: (
    personNumber: string,
    patch: Partial<ManagedStaffMember>,
  ) => void;
  closePanel: () => void;
  /** The "How this report works" legend in the right panel */
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
  /** How many panel filters narrow the report; the search box is not counted */
  activeFilterCount: number;
  /** Resets the search and every panel filter */
  clearFilters: () => void;
  selectedTabKey: StaffDetailTabEnum;
  setSelectedTabKey: React.Dispatch<React.SetStateAction<StaffDetailTabEnum>>;
  handleTabChange: (
    event: React.SyntheticEvent,
    newKey: StaffDetailTabEnum,
  ) => void;

  // Managed staff query
  staffMembers: ManagedStaffMember[];
  totalCount: number;
  staffLoading: boolean;
  /** Query failures other than the FILTER_REQUIRED guard */
  staffError: ApolloError | undefined;
  /** Set when the API asks for a narrower filter before it will list staff */
  filterRequired: FilterRequired | null;
  hasNextPage: boolean;
  loadMore: () => void;
  refetchStaff: () => void;
}

export const MpdSupervisorReportContext = createContext<
  MpdSupervisorReportContextValue | undefined
>(undefined);

// Resolve the selected tab from the `?tab=` query param, guarding against
// arbitrary URL input (arrays or values that aren't a real tab).
const parseTabFromQuery = (
  tab: string | string[] | undefined,
): StaffDetailTabEnum => {
  const value = Array.isArray(tab) ? tab[0] : tab;
  return Object.values(StaffDetailTabEnum).includes(value as StaffDetailTabEnum)
    ? (value as StaffDetailTabEnum)
    : StaffDetailTabEnum.MonthlySummary;
};

export const MpdSupervisorReportProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const router = useRouter();
  const query = router?.query;

  const [selectedMember, setSelectedMember] = useState<
    ManagedStaffMember | undefined
  >(undefined);
  const [legendOpen, setLegendOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [employmentType, setEmploymentType] =
    useState<MpdAssignmentCategoryGroupEnum | null>(null);
  const [activeQuickFilter, setActiveQuickFilter] =
    useState<MpdSupervisorReportQuickFilterEnum>(
      MpdSupervisorReportQuickFilterEnum.AllPeople,
    );
  const [selectedTabKey, setSelectedTabKey] = useState<StaffDetailTabEnum>(() =>
    parseTabFromQuery(query?.tab),
  );

  const debouncedSearch = useDebouncedValue(search, searchDebounceMs);

  const { data, loading, error, fetchMore, refetch } = useManagedStaffQuery({
    // The report renders its own error state, and the FILTER_REQUIRED guard is
    // guidance rather than a failure, so the global error toast is redundant.
    context: { suppressErrors: true },
    variables: {
      first: pageSize,
      name: debouncedSearch.trim() || null,
      teamNames: team ? [team] : null,
      departments: department ? [department] : null,
      assignmentCategoryGroup: employmentType,
      // Send the flag only when its chip is active; false would filter on it.
      negativeLastMonth:
        activeQuickFilter ===
          MpdSupervisorReportQuickFilterEnum.NegativeLastMonth || null,
      negativeThreeMonths:
        activeQuickFilter ===
          MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative || null,
    },
  });

  const pageInfo = data?.managedStaff.pageInfo;
  const [wantsNextPage, setWantsNextPage] = useState(false);
  const loadMore = useCallback(() => setWantsNextPage(true), []);

  useEffect(() => {
    if (!wantsNextPage || loading) {
      return;
    }
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) {
      setWantsNextPage(false);
      return;
    }
    setWantsNextPage(false);
    fetchMore({ variables: { after: pageInfo.endCursor } });
  }, [
    wantsNextPage,
    loading,
    pageInfo?.hasNextPage,
    pageInfo?.endCursor,
    fetchMore,
  ]);

  const refetchStaff = useCallback(() => {
    // Apollo rejects a failed refetch, but the hook's own error state reports it.
    refetch().catch(() => undefined);
  }, [refetch]);

  const filterRequired = useMemo(() => filterRequiredFromError(error), [error]);

  const activeFilterCount =
    (team ? 1 : 0) +
    (department ? 1 : 0) +
    (employmentType ? 1 : 0) +
    (activeQuickFilter === MpdSupervisorReportQuickFilterEnum.AllPeople
      ? 0
      : 1);

  const clearFilters = useCallback(() => {
    setSearch('');
    setTeam(null);
    setDepartment(null);
    setEmploymentType(null);
    setActiveQuickFilter(MpdSupervisorReportQuickFilterEnum.AllPeople);
  }, []);

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newKey: StaffDetailTabEnum) => {
      setSelectedTabKey(newKey);
      // Not router.replace: the global Loading listens to routeChangeStart
      // without checking `shallow`, so a shallow replace still flashes the
      // page spinner on every tab click.
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newKey);
      window.history.replaceState(window.history.state, '', url.toString());
    },
    [],
  );

  const value = useMemo<MpdSupervisorReportContextValue>(
    () => ({
      selectedMember,
      isOpen: selectedMember !== undefined,
      // The right panel shows one thing at a time: a staff member or the legend
      openMember: (member: ManagedStaffMember) => {
        setLegendOpen(false);
        setSelectedMember(member);
      },
      legendOpen,
      openLegend: () => {
        setSelectedMember(undefined);
        setLegendOpen(true);
      },
      closeLegend: () => setLegendOpen(false),
      updateSelectedMember: (
        personNumber: string,
        patch: Partial<ManagedStaffMember>,
      ) =>
        setSelectedMember((prev) =>
          // Apply the save to the open drawer, but never another staff member's.
          prev?.personNumber === personNumber ? { ...prev, ...patch } : prev,
        ),
      closePanel: () => setSelectedMember(undefined),
      search,
      setSearch,
      team,
      setTeam,
      department,
      setDepartment,
      employmentType,
      setEmploymentType,
      activeQuickFilter,
      setActiveQuickFilter,
      activeFilterCount,
      clearFilters,
      selectedTabKey,
      setSelectedTabKey,
      handleTabChange,
      staffMembers: data?.managedStaff.nodes ?? [],
      totalCount: data?.managedStaff.totalCount ?? 0,
      staffLoading: loading,
      staffError: filterRequired ? undefined : error,
      filterRequired,
      hasNextPage: pageInfo?.hasNextPage ?? false,
      loadMore,
      refetchStaff,
    }),
    [
      selectedMember,
      legendOpen,
      search,
      team,
      department,
      employmentType,
      activeQuickFilter,
      activeFilterCount,
      clearFilters,
      selectedTabKey,
      handleTabChange,
      data,
      loading,
      error,
      filterRequired,
      pageInfo?.hasNextPage,
      loadMore,
      refetchStaff,
    ],
  );

  return (
    <MpdSupervisorReportContext.Provider value={value}>
      {children}
    </MpdSupervisorReportContext.Provider>
  );
};

export const useMpdSupervisorReport = (): MpdSupervisorReportContextValue => {
  const ctx = useContext(MpdSupervisorReportContext);
  if (!ctx) {
    throw new Error(
      'useMpdSupervisorReport must be used within a MpdSupervisorReportProvider',
    );
  }
  return ctx;
};
