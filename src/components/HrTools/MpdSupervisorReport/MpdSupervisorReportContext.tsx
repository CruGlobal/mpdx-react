import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  ALL_TEAMS,
  ALL_TYPES,
  MpdSupervisorReportEmploymentTypeEnum,
  MpdSupervisorReportQuickFilterEnum,
  MpdSupervisorReportTeamsEnum,
} from './Filters/mpdSupervisorReportFilters';
import { StaffDetailTabEnum } from './StaffDetailsTabs/StaffDetailTab';
import { EmployeeData } from './mockData';

export enum Panel {
  Navigation = 'Navigation',
  Filters = 'Filters',
}

export interface MpdSupervisorReportContextValue {
  selectedMember: EmployeeData | undefined;
  isOpen: boolean;
  openMember: (member: EmployeeData) => void;
  closePanel: () => void;
  search: string;
  setSearch: (v: string) => void;
  team: MpdSupervisorReportTeamsEnum;
  setTeam: (v: MpdSupervisorReportTeamsEnum) => void;
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
    EmployeeData | undefined
  >(undefined);
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState<MpdSupervisorReportTeamsEnum>(ALL_TEAMS);
  const [employmentType, setEmploymentType] =
    useState<MpdSupervisorReportEmploymentTypeEnum>(ALL_TYPES);
  const [activeQuickFilter, setActiveQuickFilter] =
    useState<MpdSupervisorReportQuickFilterEnum>(
      MpdSupervisorReportQuickFilterEnum.AllPeople,
    );
  const [selectedTabKey, setSelectedTabKey] = useState<StaffDetailTabEnum>(() =>
    parseTabFromQuery(query?.tab),
  );
  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newKey: StaffDetailTabEnum) => {
      setSelectedTabKey(newKey);
      router?.replace({ query: { ...router.query, tab: newKey } }, undefined, {
        shallow: true,
      });
    },
    [router],
  );

  const value = useMemo<MpdSupervisorReportContextValue>(
    () => ({
      selectedMember,
      isOpen: selectedMember !== undefined,
      openMember: (member: EmployeeData) => setSelectedMember(member),
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
    }),
    [
      selectedMember,
      search,
      team,
      employmentType,
      activeQuickFilter,
      selectedTabKey,
      handleTabChange,
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
