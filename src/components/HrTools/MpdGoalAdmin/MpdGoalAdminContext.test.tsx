import { act, renderHook } from '@testing-library/react';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from './MpdGoalAdminContext';
import { mockCohorts } from './mockData';
import { MpdGoalAdminTabEnum } from './mpdGoalAdminHelpers';

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

  it('throws when used outside its provider', () => {
    expect(() => renderHook(() => useMpdGoalAdmin())).toThrow(
      'useMpdGoalAdmin must be used within a MpdGoalAdminProvider',
    );
  });
});
