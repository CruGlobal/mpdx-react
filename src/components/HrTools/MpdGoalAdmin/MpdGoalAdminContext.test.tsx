import { act, renderHook } from '@testing-library/react';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from './MpdGoalAdminContext';
import { mockCohorts } from './mockData';
import { MpdGoalAdminTabEnum, TrainingCosts } from './mpdGoalAdminHelpers';

const trainingCosts: TrainingCosts = {
  nsoIndividual1InRoom: 100,
  nsoIndividual2InRoom: 200,
  nsoCouple: 300,
  nsoFamily: 400,
  ibsSingle: 500,
  ibsCouple: 600,
  refreshRetreatSingle: 700,
  refreshRetreatCouple: 800,
  faithAndFinanceSingle: 900,
  faithAndFinanceCouple: 1000,
  cruConferenceSingle: 1100,
  cruConferenceCouple: 1200,
  cruConferenceFamily: 1300,
};

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MpdGoalAdminProvider>{children}</MpdGoalAdminProvider>
);

describe('MpdGoalAdminContext', () => {
  it('defaults to the active-goals tab and first cohort', () => {
    const { result } = renderHook(() => useMpdGoalAdmin(), { wrapper });
    expect(result.current.activeTab).toBe(MpdGoalAdminTabEnum.ActiveGoals);
    expect(result.current.selectedCohort?.id).toBe(mockCohorts[0].id);
  });

  it('toggles row selection and clears it', () => {
    const { result } = renderHook(() => useMpdGoalAdmin(), { wrapper });
    act(() => result.current.toggleRow('row-1'));
    expect(result.current.selectedRowIds.has('row-1')).toBe(true);
    act(() => result.current.toggleRow('row-1'));
    expect(result.current.selectedRowIds.has('row-1')).toBe(false);
    act(() => result.current.toggleRow('row-2'));
    act(() => result.current.clearSelection());
    expect(result.current.selectedRowIds.size).toBe(0);
  });

  it('excludes search-hidden rows from selectedRows without forgetting them', () => {
    const { result } = renderHook(() => useMpdGoalAdmin(), { wrapper });
    act(() => result.current.toggleRow('row-1'));
    expect(result.current.selectedRows.map((row) => row.id)).toEqual(['row-1']);

    // A search that hides row-1 drops it from selectedRows (so the count can't
    // lie) but keeps its id in the set so clearing the search restores it.
    act(() => result.current.setSearch('carlos'));
    expect(result.current.selectedRows).toHaveLength(0);
    expect(result.current.selectedRowIds.has('row-1')).toBe(true);

    act(() => result.current.setSearch(''));
    expect(result.current.selectedRows.map((row) => row.id)).toEqual(['row-1']);
  });

  it('clears the selection when the cohort changes', () => {
    const { result } = renderHook(() => useMpdGoalAdmin(), { wrapper });
    act(() => result.current.toggleRow('row-1'));
    expect(result.current.selectedRowIds.size).toBe(1);

    act(() => result.current.setSelectedCohortId('a-different-cohort'));
    expect(result.current.selectedRowIds.size).toBe(0);
  });

  it('saves training costs and marks them as entered for the cohort', () => {
    const { result } = renderHook(() => useMpdGoalAdmin(), { wrapper });
    const cohortId = mockCohorts[0].id;

    act(() => result.current.saveTrainingCosts(cohortId, trainingCosts));

    expect(result.current.selectedCohort?.trainingCosts).toEqual(trainingCosts);
    expect(result.current.selectedCohort?.trainingCostEntered).toBe(true);
  });

  it('assigns a coach to exactly the given rows', () => {
    const { result } = renderHook(() => useMpdGoalAdmin(), { wrapper });

    act(() => result.current.assignCoach(['row-1', 'row-2'], 'Tom Harris'));

    const rows = result.current.cohorts[0].rows;
    expect(rows.find((row) => row.id === 'row-1')?.coach).toBe('Tom Harris');
    expect(rows.find((row) => row.id === 'row-2')?.coach).toBe('Tom Harris');
    expect(rows.find((row) => row.id === 'row-3')?.coach).toBe('Nelson Jones');
  });

  it('throws when used outside its provider', () => {
    expect(() => renderHook(() => useMpdGoalAdmin())).toThrow(
      'useMpdGoalAdmin must be used within a MpdGoalAdminProvider',
    );
  });
});
