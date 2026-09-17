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
import { useDebouncedValue } from 'src/hooks/useDebounce';
import {
  ALL_TEAMS,
  ALL_TYPES,
  MpdSupervisorReportEmploymentTypeEnum,
  MpdSupervisorReportQuickFilterEnum,
} from './Filters/mpdSupervisorReportFilters';
import { useManagedStaffQuery } from './ManagedStaff.generated';
import { StaffDetailTabEnum } from './StaffDetailsTabs/StaffDetailTab';
import { ManagedStaffMember } from './helpers';

export enum Panel {
  Navigation = 'Navigation',
  Filters = 'Filters',
}

const searchDebounceMs = 500;
const pageSize = 25;

export interface MpdSupervisorReportContextValue {
  selectedMember: ManagedStaffMember | undefined;
  isOpen: boolean;
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
  staffError: ApolloError | undefined;
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
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState<string>(ALL_TEAMS);
  const [employmentType, setEmploymentType] =
    useState<MpdSupervisorReportEmploymentTypeEnum>(ALL_TYPES);
  const [activeQuickFilter, setActiveQuickFilter] =
    useState<MpdSupervisorReportQuickFilterEnum>(
      MpdSupervisorReportQuickFilterEnum.AllPeople,
    );
  const [selectedTabKey, setSelectedTabKey] = useState<StaffDetailTabEnum>(() =>
    parseTabFromQuery(query?.tab),
  );

  const debouncedSearch = useDebouncedValue(search, searchDebounceMs);

  // TODO(MPDX-9987): Add employment type filter once the API supports it
  const { data, loading, error, fetchMore, refetch } = useManagedStaffQuery({
    variables: {
      first: pageSize,
      name: debouncedSearch.trim() || null,
      teamIds: team === ALL_TEAMS ? null : [team],
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
      openMember: (member: ManagedStaffMember) => setSelectedMember(member),
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
      employmentType,
      setEmploymentType,
      activeQuickFilter,
      setActiveQuickFilter,
      selectedTabKey,
      setSelectedTabKey,
      handleTabChange,
      staffMembers: data?.managedStaff.nodes ?? [],
      totalCount: data?.managedStaff.totalCount ?? 0,
      staffLoading: loading,
      staffError: error,
      hasNextPage: pageInfo?.hasNextPage ?? false,
      loadMore,
      refetchStaff,
    }),
    [
      selectedMember,
      search,
      team,
      employmentType,
      activeQuickFilter,
      selectedTabKey,
      handleTabChange,
      data,
      loading,
      error,
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
