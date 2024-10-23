import { useEffect, useState } from 'react';
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

  const toggleSelectionById = (id: string) => {
    setIds((previousIds) => {
      if (previousIds.includes(id)) {
        return previousIds.filter((selectedIds) => selectedIds !== id);
      } else {
        return [...previousIds, id];
      }
    });
  };

  const selectMultipleIds = (newIds: string[]) => {
    setIds((previousIds) => [
      ...previousIds,
      ...newIds.filter((newId) => !ids.includes(newId)),
    ]);
  };

  const deselectMultipleIds = (idsToRemove: string[]) => {
    setIds((previousIds) =>
      previousIds.filter((id) => !idsToRemove.includes(id)),
    );
  };

  const deselectAll = () => {
    setIds([]);
  };

  const toggleSelectAll = () => {
    if (ids.length === totalCount) {
      setIds([]);
    } else {
      setIds(idsList);
    }
  };

  const isRowChecked = (id: string) => ids.includes(id);

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
