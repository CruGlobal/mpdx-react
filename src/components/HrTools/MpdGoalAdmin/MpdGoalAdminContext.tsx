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
  /** Attendees the query returned; the API does the search matching. */
  filteredRows: StaffGoalRow[];
  /** True while cohorts or the selected cohort's attendees are still loading. */
  loading: boolean;
  error: ApolloError | undefined;
  selectedRowIds: Set<string>;
  /** Selected rows that are actually visible, so the count never overstates. */
  selectedRows: StaffGoalRow[];
  toggleRow: (id: string) => void;
  toggleRows: (ids: string[]) => void;
  clearSelection: () => void;
  /** Saves training costs; resolves once dependent goals have been refetched. */
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
  // TODO(MPDX-9914): drop once assignCoach is a real mutation.
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

  // Stale ids from another cohort would mislead the count and bulk actions.
  const selectCohort = useCallback(
    (id: string) => {
      if (id !== selectedCohortId) {
        setSelectedRowIds(new Set());
      }
      setSelectedCohortId(id);
    },
    [selectedCohortId],
  );

  // The cohort list arrives after mount, so the initial selection happens here.
  useEffect(() => {
    if (cohorts.length && !cohorts.some(({ id }) => id === selectedCohortId)) {
      selectCohort(cohorts[0].id);
    }
  }, [cohorts, selectedCohortId, selectCohort]);

  const {
    data: attendeesData,
    previousData: previousAttendeesData,
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

  // Keep previous rows through a search refetch, but never another cohort's.
  const visibleAttendeesData =
    attendeesData ??
    (previousAttendeesData?.newStaffCohort.id === selectedCohortId
      ? previousAttendeesData
      : undefined);

  const filteredRows = useMemo(() => {
    const rows =
      visibleAttendeesData?.newStaffCohort.attendees.nodes.map(attendeeToRow) ??
      [];
    return rows.map((row) =>
      coachOverrides[row.id] ? { ...row, coach: coachOverrides[row.id] } : row,
    );
  }, [visibleAttendeesData, coachOverrides]);

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
        // The cohort normalizes itself; attendee goals need a real refetch.
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

  const selectedCohort = useMemo(
    () => cohorts.find((cohort) => cohort.id === selectedCohortId),
    [cohorts, selectedCohortId],
  );

  // A row hidden by search keeps its id but must not count as selected.
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
      // Skipped without a selection, so zero cohorts must not spin forever.
      loading:
        cohortsLoading ||
        (selectedCohortId ? attendeesLoading : cohorts.length > 0),
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
