import { useEffect, useState } from 'react';
import { ListHeaderCheckBoxState } from '../components/Shared/Header/ListHeader';

export const useMassSelection = (
  totalCount: number,
): {
  selectionType: ListHeaderCheckBoxState;
  isRowChecked: (id: string) => boolean;
  toggleSelectAll: () => void;
  toggleSelectionById: (id: string) => void;
} => {
  const [selectionType, setSelectionType] = useState(
    ListHeaderCheckBoxState.unchecked,
  );
  const [ids, setIds] = useState<string[]>([]);
  const [reverseIds, setReverseIds] = useState<string[]>([]);

  useEffect(() => {
    if (selectionType === ListHeaderCheckBoxState.partial && ids.length === 0) {
      setSelectionType(ListHeaderCheckBoxState.unchecked);
    }

    if (
      selectionType === ListHeaderCheckBoxState.checked &&
      reverseIds.length === totalCount
    ) {
      setSelectionType(ListHeaderCheckBoxState.unchecked);
      setReverseIds([]);
    }

    if (
      selectionType === ListHeaderCheckBoxState.partial &&
      ids.length === totalCount
    ) {
      setSelectionType(ListHeaderCheckBoxState.checked);
      setIds([]);
    }
  }, [ids, reverseIds]);

  const toggleSelectionById = (id: string) => {
    switch (selectionType) {
      case ListHeaderCheckBoxState.partial:
        const currentIndex = ids.indexOf(id);
        if (currentIndex !== -1) {
          setIds((previousIds) =>
            previousIds.filter((selectedIds) => selectedIds !== id),
          );
        } else {
          setIds((previousIds) => [...previousIds, id]);
        }
        break;
      case ListHeaderCheckBoxState.checked:
        const currentReverseIndex = reverseIds.indexOf(id);
        if (currentReverseIndex !== -1) {
          setReverseIds((previousIds) =>
            previousIds.filter((previousId) => previousId !== id),
          );
        } else {
          setReverseIds((previousIds) => [...previousIds, id]);
        }
        break;
      case ListHeaderCheckBoxState.unchecked:
        setIds((previousIds) => [...previousIds, id]);
        setSelectionType(ListHeaderCheckBoxState.partial);
        break;
    }
  };

  const toggleSelectAll = () => {
    switch (selectionType) {
      case ListHeaderCheckBoxState.partial:
        setSelectionType(ListHeaderCheckBoxState.checked);
        setIds([]);
        setReverseIds([]);
        break;
      case ListHeaderCheckBoxState.checked:
        setSelectionType(ListHeaderCheckBoxState.unchecked);
        setIds([]);
        setReverseIds([]);
        break;
      case ListHeaderCheckBoxState.unchecked:
        setIds([]);
        setReverseIds([]);
        setSelectionType(ListHeaderCheckBoxState.checked);
        break;
    }
  };

  const isRowChecked = (id: string) =>
    (selectionType === ListHeaderCheckBoxState.partial && ids.includes(id)) ||
    (selectionType === ListHeaderCheckBoxState.checked &&
      !reverseIds.includes(id));

  return {
    selectionType,
    isRowChecked,
    toggleSelectAll,
    toggleSelectionById,
  };
};
