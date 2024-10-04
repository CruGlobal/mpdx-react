import { useState } from 'react';
import { ListHeaderCheckBoxState } from '../components/Shared/Header/ListHeader';

export const useMassSelection = (
  idsList: string[],
): {
  ids: string[];
  selectionType: ListHeaderCheckBoxState;
  isRowChecked: (id: string) => boolean;
  deselectAll: () => void;
  toggleSelectAll: () => void;
  toggleSelectionById: (id: string) => void;
  selectMultipleIds: (ids: string[]) => void;
  deselectMultipleIds: (ids: string[]) => void;
} => {
  const totalCount = idsList.length;

  const [ids, setIds] = useState<string[]>([]);

  const toggleSelectionById = (id: string) => {
    if (ids.includes(id)) {
      setIds((previousIds) =>
        previousIds.filter((selectedIds) => selectedIds !== id),
      );
    } else {
      setIds((previousIds) => [...previousIds, id]);
    }
  };

  const selectMultipleIds = (newIds: string[]) => {
    setIds([...ids, ...newIds]);
  };

  const deselectMultipleIds = (idsToRemove: string[]) => {
    setIds(ids.filter((id) => !idsToRemove.includes(id)));
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
