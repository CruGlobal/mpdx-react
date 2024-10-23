import { renderHook } from '@testing-library/react';
import { ListHeaderCheckBoxState } from 'src/components/Shared/Header/ListHeader';
import { UseMassSelectionResult, useMassSelection } from './useMassSelection';

const defaultIdsList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

describe('useMassSelection', () => {
  describe('toggleSelectAll()', () => {
    it('should select all the ids', () => {
      const { result, rerender } = renderHook(() =>
        useMassSelection(defaultIdsList),
      );

      expect(result.current.ids).toEqual([]);

      result.current.toggleSelectAll();
      rerender();
      expect(result.current.ids).toEqual(defaultIdsList);

      result.current.toggleSelectAll();
      rerender();
      expect(result.current.ids).toEqual([]);
    });
  });

  describe('deselectAll()', () => {
    it('should deselect all the ids', () => {
      const { result, rerender } = renderHook(() =>
        useMassSelection(defaultIdsList),
      );

      result.current.toggleSelectAll();
      rerender();
      expect(result.current.ids).toEqual(defaultIdsList);

      result.current.deselectAll();
      rerender();
      expect(result.current.ids).toEqual([]);
    });
  });

  describe('isRowChecked() & toggleSelectionById()', () => {
    it('should return true/false if the id has been selected', () => {
      const { result, rerender } = renderHook(() =>
        useMassSelection(defaultIdsList),
      );

      result.current.toggleSelectionById('5');
      rerender();
      expect(result.current.ids).toEqual(['5']);
      expect(result.current.isRowChecked('4')).toBe(false);
      expect(result.current.isRowChecked('5')).toBe(true);
      expect(result.current.isRowChecked('6')).toBe(false);

      result.current.toggleSelectionById('6');
      rerender();
      expect(result.current.isRowChecked('4')).toBe(false);
      expect(result.current.isRowChecked('5')).toBe(true);
      expect(result.current.isRowChecked('6')).toBe(true);
    });
  });

  describe('selectionType', () => {
    it('should return what type of selection', () => {
      const { result, rerender } = renderHook(() =>
        useMassSelection(defaultIdsList),
      );

      result.current.toggleSelectionById('5');
      rerender();
      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.Partial,
      );

      result.current.toggleSelectAll();
      rerender();
      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.Checked,
      );

      result.current.toggleSelectAll();
      rerender();
      expect(result.current.selectionType).toEqual(
        ListHeaderCheckBoxState.Unchecked,
      );
    });
  });

  describe('selectMultipleIds()', () => {
    it('should select multiple ids and deduplicate selected ids', () => {
      const { result, rerender } = renderHook(() =>
        useMassSelection(defaultIdsList),
      );

      result.current.selectMultipleIds(['1', '2', '3']);
      rerender();
      expect(result.current.ids).toEqual(['1', '2', '3']);

      result.current.selectMultipleIds(['3', '4', '5', '6']);
      rerender();
      expect(result.current.ids).toEqual(['1', '2', '3', '4', '5', '6']);
    });
  });

  describe('deselectMultipleIds()', () => {
    it('should deselect multiple ids', () => {
      const { result, rerender } = renderHook(() =>
        useMassSelection(defaultIdsList),
      );

      result.current.toggleSelectAll();
      rerender();
      expect(result.current.ids).toEqual(defaultIdsList);

      result.current.deselectMultipleIds(['4', '5', '6']);
      rerender();
      expect(result.current.ids).toEqual(['1', '2', '3', '7', '8', '9', '10']);
    });
  });

  it('deselects removed ids', () => {
    const { result, rerender } = renderHook<
      UseMassSelectionResult,
      { ids: string[] }
    >(({ ids }) => useMassSelection(ids), {
      initialProps: { ids: defaultIdsList },
    });

    result.current.selectMultipleIds(['1', '2', '3']);

    rerender({ ids: ['2', '3', '4'] });
    expect(result.current.ids).toEqual(['2', '3']);
  });
});
