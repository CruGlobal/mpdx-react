import { renderHook } from '@testing-library/react-hooks';
import { ListHeaderCheckBoxState } from '../../components/Shared/Header/ListHeader';
import { useMassSelection } from '../useMassSelection';

const id = '123';
describe('useMassSelection', () => {
  //#region Default Tests
  it('should return selectionType', () => {
    const { result } = renderHook(() => useMassSelection(10), {});

    expect(result.current.selectionType).toEqual(
      ListHeaderCheckBoxState.unchecked,
    );
  });
  //#endregion

  //#region ToggleSelectionById Tests
  describe('toggleSelectionById', () => {
    it('should toggle a row as selected', () => {
      const { result } = renderHook(() => useMassSelection(10), {});

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.unchecked,
      );

      result.current.toggleSelectionById(id);

      expect(result.current.isRowChecked(id)).toBe(true);
      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.partial,
      );
      expect(result.current.ids).toEqual([id]);
    });

    it('should unselect a selected row', () => {
      const { result, rerender } = renderHook(() => useMassSelection(10), {});

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.unchecked,
      );
      // Toggle to selected
      result.current.toggleSelectionById(id);

      expect(result.current.isRowChecked(id)).toBe(true);
      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.partial,
      );
      expect(result.current.ids).toEqual([id]);
      // Toggle to unselected
      result.current.toggleSelectionById(id);

      expect(result.current.isRowChecked(id)).toBe(false);

      rerender();

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.unchecked,
      );
      expect(result.current.ids).toEqual([]);
    });

    it('should switch to All if all ids selected', () => {
      const { result, rerender } = renderHook(() => useMassSelection(3), {});

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.unchecked,
      );
      // Toggle to selected
      result.current.toggleSelectionById(id);
      result.current.toggleSelectionById('321');
      result.current.toggleSelectionById('231');

      expect(result.current.isRowChecked(id)).toBe(true);
      expect(result.current.isRowChecked('321')).toBe(true);
      expect(result.current.isRowChecked('231')).toBe(true);
      expect(result.current.ids).toEqual([id, '321', '231']);
      rerender();

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.checked,
      );
      expect(result.current.ids).toEqual([]);
    });

    it('should switch to None if all ids are unselected', () => {
      const { result, rerender } = renderHook(() => useMassSelection(3), {});

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.unchecked,
      );

      result.current.toggleSelectAll();

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.checked,
      );

      // Toggle to unselected
      result.current.toggleSelectionById(id);
      result.current.toggleSelectionById('321');
      result.current.toggleSelectionById('231');

      expect(result.current.isRowChecked(id)).toBe(false);
      expect(result.current.isRowChecked('321')).toBe(false);
      expect(result.current.isRowChecked('231')).toBe(false);

      rerender();

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.unchecked,
      );
    });

    it('should retoggled an id that was previously selected', () => {
      const { result, rerender } = renderHook(() => useMassSelection(3), {});

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.unchecked,
      );

      result.current.toggleSelectAll();

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.checked,
      );

      // Toggle to unselected
      result.current.toggleSelectionById(id);

      expect(result.current.isRowChecked(id)).toBe(false);

      expect(result.current.reverseIds).toEqual([id]);

      // Retoggle back to selected
      result.current.toggleSelectionById(id);

      expect(result.current.isRowChecked(id)).toBe(true);

      rerender();

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.checked,
      );
    });
  });
  //#endregion

  //#region ToggleSelectAll Tests
  describe('toggleSelectAll', () => {
    it('Partial', () => {
      const { result } = renderHook(() => useMassSelection(10), {});

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.unchecked,
      );
      // Toggle to selected
      result.current.toggleSelectionById(id);

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.partial,
      );

      result.current.toggleSelectAll();

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.checked,
      );
    });
    it('None', () => {
      const { result } = renderHook(() => useMassSelection(10), {});

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.unchecked,
      );

      result.current.toggleSelectAll();

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.checked,
      );
    });

    it('All', () => {
      const { result } = renderHook(() => useMassSelection(10), {});

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.unchecked,
      );
      // Toggle to all
      result.current.toggleSelectAll();

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.checked,
      );
      // Toggle back to none
      result.current.toggleSelectAll();

      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.unchecked,
      );
    });
  });
  //#endregion
});
