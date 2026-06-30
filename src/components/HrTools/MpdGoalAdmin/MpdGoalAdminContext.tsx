import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Cohort, StaffGoalRow, mockCohorts } from './mockData';
import { MpdGoalAdminTabEnum } from './mpdGoalAdminHelpers';

export interface MpdGoalAdminContextValue {
  activeTab: MpdGoalAdminTabEnum;
  setActiveTab: (tab: MpdGoalAdminTabEnum) => void;
  cohorts: Cohort[];
  selectedCohortId: string;
  setSelectedCohortId: (id: string) => void;
  selectedCohort: Cohort | undefined;
  search: string;
  setSearch: (value: string) => void;
  /** Rows of the selected cohort that match the current search term. */
  filteredRows: StaffGoalRow[];
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
  openMember: StaffGoalRow | undefined;
  openRow: (row: StaffGoalRow) => void;
  closeDrawer: () => void;
  isDrawerOpen: boolean;
}

const MpdGoalAdminContext = createContext<MpdGoalAdminContextValue | undefined>(
  undefined,
);

export const MpdGoalAdminProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const cohorts = mockCohorts;
  const [activeTab, setActiveTab] = useState<MpdGoalAdminTabEnum>(
    MpdGoalAdminTabEnum.ActiveGoals,
  );
  const [selectedCohortId, setSelectedCohortId] = useState<string>(
    cohorts[0]?.id ?? '',
  );
  const [search, setSearch] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [openMember, setOpenMember] = useState<StaffGoalRow | undefined>(
    undefined,
  );

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

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = selectedCohort?.rows ?? [];
    if (!term) {
      return rows;
    }
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(term) ||
        row.email.toLowerCase().includes(term),
    );
  }, [selectedCohort, search]);

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
      selectedRowIds,
      selectedRows,
      toggleRow,
      toggleRows,
      clearSelection,
      openMember,
      openRow: (row: StaffGoalRow) => setOpenMember(row),
      closeDrawer: () => setOpenMember(undefined),
      isDrawerOpen: openMember !== undefined,
    }),
    [
      activeTab,
      cohorts,
      selectedCohortId,
      selectCohort,
      selectedCohort,
      search,
      filteredRows,
      selectedRowIds,
      selectedRows,
      toggleRow,
      toggleRows,
      clearSelection,
      openMember,
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
