import { useCallback, useEffect, useState } from 'react';
import { ListHeaderCheckBoxState } from '../components/Shared/Header/ListHeader';

export interface UseMassSelectionResult {
  ids: string[];
  selectionType: ListHeaderCheckBoxState;
  isRowChecked: (id: string) => boolean;
  deselectAll: () => void;
  toggleSelectAll: () => void;
  toggleSelectionById: (id: string) => void;
  selectMultipleIds: (ids: string[]) => void;
  deselectMultipleIds: (ids: string[]) => void;
}

export const useMassSelection = (idsList: string[]): UseMassSelectionResult => {
  const totalCount = idsList.length;

  const [ids, setIds] = useState<string[]>([]);

  // When the idsList change, deselect any ids that were removed
  useEffect(() => {
    setIds((previousIds) => previousIds.filter((id) => idsList.includes(id)));
  }, [idsList]);

  const toggleSelectionById = useCallback((id: string) => {
    setIds((previousIds) => {
      if (previousIds.includes(id)) {
        return previousIds.filter((selectedIds) => selectedIds !== id);
      } else {
        return [...previousIds, id];
      }
    });
  }, []);

  const selectMultipleIds = useCallback((newIds: string[]) => {
    setIds((previousIds) => [
      ...previousIds,
      ...newIds.filter((newId) => !previousIds.includes(newId)),
    ]);
  }, []);

  const deselectMultipleIds = useCallback((idsToRemove: string[]) => {
    setIds((previousIds) =>
      previousIds.filter((id) => !idsToRemove.includes(id)),
    );
  }, []);

  const deselectAll = useCallback(() => {
    setIds([]);
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (ids.length === totalCount) {
      setIds([]);
    } else {
      setIds(idsList);
    }
  }, [ids, totalCount, idsList]);

  const isRowChecked = useCallback((id: string) => ids.includes(id), [ids]);

  return {
    ids,
    selectionType:
      ids.length === 0
        ? ListHeaderCheckBoxState.Unchecked
        : ids.length === totalCount
        ? ListHeaderCheckBoxState.Checked
        : ListHeaderCheckBoxState.Partial,
    isRowChecked,
    deselectAll,
    toggleSelectAll,
    toggleSelectionById,
    selectMultipleIds,
    deselectMultipleIds,
  };
};
