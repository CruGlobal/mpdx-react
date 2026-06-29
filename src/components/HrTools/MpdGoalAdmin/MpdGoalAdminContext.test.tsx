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

  it('opens and closes the staff detail drawer', () => {
    const { result } = renderHook(() => useMpdGoalAdmin(), { wrapper });
    const row = mockCohorts[0].rows[0];
    act(() => result.current.openRow(row));
    expect(result.current.isDrawerOpen).toBe(true);
    expect(result.current.openMember?.id).toBe(row.id);
    act(() => result.current.closeDrawer());
    expect(result.current.isDrawerOpen).toBe(false);
  });

  it('throws when used outside its provider', () => {
    expect(() => renderHook(() => useMpdGoalAdmin())).toThrow(
      'useMpdGoalAdmin must be used within a MpdGoalAdminProvider',
    );
  });
});
