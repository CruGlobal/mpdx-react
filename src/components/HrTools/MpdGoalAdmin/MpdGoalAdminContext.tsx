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
  selectedRowIds: Set<string>;
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

  const value = useMemo<MpdGoalAdminContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      cohorts,
      selectedCohortId,
      setSelectedCohortId,
      selectedCohort: cohorts.find((cohort) => cohort.id === selectedCohortId),
      search,
      setSearch,
      selectedRowIds,
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
      search,
      selectedRowIds,
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
