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
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { useLocale } from 'src/hooks/useLocale';
import {
  useNewStaffCohortAttendeesQuery,
  useNewStaffCohortsQuery,
  useUpdateNewStaffCohortMutation,
} from './NewStaffCohorts.generated';
import {
  Cohort,
  MpdGoalAdminTabEnum,
  StaffGoalRow,
  TrainingCosts,
  attendeeToRow,
  cohortNodeToCohort,
  trainingCostsToAttributes,
} from './mpdGoalAdminHelpers';

/** Matches the debounce the contacts search uses, so typing isn't a query per keystroke. */
const searchDebounceMs = 500;

export interface MpdGoalAdminContextValue {
  activeTab: MpdGoalAdminTabEnum;
  setActiveTab: (tab: MpdGoalAdminTabEnum) => void;
  cohorts: Cohort[];
  selectedCohortId: string;
  setSelectedCohortId: (id: string) => void;
  selectedCohort: Cohort | undefined;
  search: string;
  setSearch: (value: string) => void;
  /**
   * Rows of the selected cohort matching the current search term. The API does
   * the matching (it can search fields the table never displays, such as
   * email), so this is simply every attendee the query returned.
   */
  filteredRows: StaffGoalRow[];
  /** True while cohorts or the selected cohort's attendees are still loading. */
  loading: boolean;
  error: ApolloError | undefined;
  selectedRowIds: Set<string>;
  /**
   * The currently visible (filtered) rows that are selected. Derived from
   * `filteredRows` so the selection never includes rows hidden by the search
   * term or belonging to a cohort that is no longer selected.
   */
  selectedRows: StaffGoalRow[];
  toggleRow: (id: string) => void;
  toggleRows: (ids: string[]) => void;
  clearSelection: () => void;
  /**
   * Saves the cohort's training costs. Resolves once the goal amounts and
   * statuses that depend on them have been refetched, so awaiting this means
   * the table is already up to date. Rejects if the mutation fails.
   */
  saveTrainingCosts: (cohortId: string, costs: TrainingCosts) => Promise<void>;
  /** Assigns one coach to every row in `rowIds`, across all cohorts. */
  assignCoach: (rowIds: string[], coachName: string) => void;
}

const MpdGoalAdminContext = createContext<MpdGoalAdminContextValue | undefined>(
  undefined,
);

export const MpdGoalAdminProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<MpdGoalAdminTabEnum>(
    MpdGoalAdminTabEnum.ActiveGoals,
  );
  const [selectedCohortId, setSelectedCohortId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  // TODO(MPDX-9914): drop this once assignCoach is a real mutation and the
  // assigned coach comes back on the attendee. Until then the assignment is
  // layered over the fetched rows so the flow still demos end to end.
  const [coachOverrides, setCoachOverrides] = useState<Record<string, string>>(
    {},
  );

  const debouncedSearch = useDebouncedValue(search, searchDebounceMs);

  const {
    data: cohortsData,
    error: cohortsError,
    fetchMore: fetchMoreCohorts,
  } = useNewStaffCohortsQuery();
  const { loading: cohortsLoading } = useFetchAllPages({
    fetchMore: fetchMoreCohorts,
    error: cohortsError,
    pageInfo: cohortsData?.newStaffCohorts.pageInfo,
  });

  const cohorts = useMemo(
    () =>
      cohortsData?.newStaffCohorts.nodes.map((node) =>
        cohortNodeToCohort(node, locale),
      ) ?? [],
    [cohortsData, locale],
  );

  // The cohort list arrives after mount, so the initial selection can only be
  // made here. Re-runs if the selected cohort disappears from the list.
  useEffect(() => {
    if (cohorts.length && !cohorts.some(({ id }) => id === selectedCohortId)) {
      setSelectedCohortId(cohorts[0].id);
    }
  }, [cohorts, selectedCohortId]);

  const {
    data: attendeesData,
    error: attendeesError,
    fetchMore: fetchMoreAttendees,
  } = useNewStaffCohortAttendeesQuery({
    variables: {
      cohortId: selectedCohortId,
      search: debouncedSearch.trim() || null,
    },
    skip: !selectedCohortId,
  });
  const { loading: attendeesLoading } = useFetchAllPages({
    fetchMore: fetchMoreAttendees,
    error: attendeesError,
    pageInfo: attendeesData?.newStaffCohort.attendees.pageInfo,
  });

  const filteredRows = useMemo(() => {
    const rows =
      attendeesData?.newStaffCohort.attendees.nodes.map(attendeeToRow) ?? [];
    return rows.map((row) =>
      coachOverrides[row.id] ? { ...row, coach: coachOverrides[row.id] } : row,
    );
  }, [attendeesData, coachOverrides]);

  const [updateNewStaffCohort] = useUpdateNewStaffCohortMutation();

  const toggleRow = useCallback((id: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Select all `ids` if any are unselected; otherwise deselect them all.
  const toggleRows = useCallback((ids: string[]) => {
    setSelectedRowIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedRowIds(new Set()), []);

  const saveTrainingCosts = useCallback(
    async (cohortId: string, costs: TrainingCosts) => {
      await updateNewStaffCohort({
        variables: {
          input: {
            id: cohortId,
            attributes: trainingCostsToAttributes(costs),
          },
        },
        // The mutation returns the cohort, so its costs, `hasTrainingCosts` and
        // run-and-send blockers normalize into the cache on their own. The
        // attendees are a separate query whose goal amounts and statuses the
        // server recomputes from the new costs, so they need a real refetch —
        // awaited so callers can toast only once the table actually reflects it.
        refetchQueries: ['NewStaffCohortAttendees'],
        awaitRefetchQueries: true,
      });
    },
    [updateNewStaffCohort],
  );

  const assignCoach = useCallback((rowIds: string[], coachName: string) => {
    setCoachOverrides((prev) => {
      const next = { ...prev };
      rowIds.forEach((id) => (next[id] = coachName));
      return next;
    });
  }, []);

  // Switching cohorts clears the selection: selecting staff across different
  // training cohorts is meaningless, and stale ids would otherwise linger in
  // the set and mislead the selection count and any bulk action.
  const selectCohort = useCallback(
    (id: string) => {
      if (id !== selectedCohortId) {
        setSelectedRowIds(new Set());
      }
      setSelectedCohortId(id);
    },
    [selectedCohortId],
  );

  const selectedCohort = useMemo(
    () => cohorts.find((cohort) => cohort.id === selectedCohortId),
    [cohorts, selectedCohortId],
  );

  // Only count/act on rows the user can currently see. A row hidden by the
  // search term keeps its id in `selectedRowIds` (so clearing the search
  // restores it) but is excluded here so the count never lies.
  const selectedRows = useMemo(
    () => filteredRows.filter((row) => selectedRowIds.has(row.id)),
    [filteredRows, selectedRowIds],
  );

  const value = useMemo<MpdGoalAdminContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      cohorts,
      selectedCohortId,
      setSelectedCohortId: selectCohort,
      selectedCohort,
      search,
      setSearch,
      filteredRows,
      loading: cohortsLoading || attendeesLoading,
      error: cohortsError ?? attendeesError,
      selectedRowIds,
      selectedRows,
      toggleRow,
      toggleRows,
      clearSelection,
      saveTrainingCosts,
      assignCoach,
    }),
    [
      activeTab,
      cohorts,
      selectedCohortId,
      selectCohort,
      selectedCohort,
      search,
      filteredRows,
      cohortsLoading,
      attendeesLoading,
      cohortsError,
      attendeesError,
      selectedRowIds,
      selectedRows,
      toggleRow,
      toggleRows,
      clearSelection,
      saveTrainingCosts,
      assignCoach,
    ],
  );

  return (
    <MpdGoalAdminContext.Provider value={value}>
      {children}
    </MpdGoalAdminContext.Provider>
  );
};

export const useMpdGoalAdmin = (): MpdGoalAdminContextValue => {
  const ctx = useContext(MpdGoalAdminContext);
  if (!ctx) {
    throw new Error(
      'useMpdGoalAdmin must be used within a MpdGoalAdminProvider',
    );
  }
  return ctx;
};
