import { useEffect, useState } from 'react';
import { ContactFilterSetInput } from '../../graphql/types.generated';
import { ListHeaderCheckBoxState } from '../components/Shared/Header/ListHeader';

export const useMassSelection = (
  totalCount: number,
  idsList: string[],
  activeFilters?: ContactFilterSetInput,
  wildcardSearch?: string,
  starredFilter?: ContactFilterSetInput,
): {
  ids: string[];
  selectionType: ListHeaderCheckBoxState;
  isRowChecked: (id: string) => boolean;
  toggleSelectAll: () => void;
  toggleSelectionById: (id: string) => void;
} => {
  const [selectionType, setSelectionType] = useState(
    ListHeaderCheckBoxState.unchecked,
  );
  const [ids, setIds] = useState<string[]>([]);

  //console.log(idsList);

  const toggleSelectionById = (id: string) => {
    switch (selectionType) {
      case ListHeaderCheckBoxState.partial:
        if (ids.includes(id)) {
          setIds((previousIds) =>
            previousIds.filter((selectedIds) => selectedIds !== id),
          );
          if (ids.length - 1 === 0) {
            setSelectionType(ListHeaderCheckBoxState.unchecked);
          }
        } else {
          setIds((previousIds) => [...previousIds, id]);
          if (ids.length + 1 === totalCount) {
            setSelectionType(ListHeaderCheckBoxState.checked);
          }
        }
        break;
      case ListHeaderCheckBoxState.checked:
        if (ids.includes(id)) {
          setIds((previousIds) =>
            previousIds.filter((previousId) => previousId !== id),
          );
          setSelectionType(
            ids.length - 1 === 0
              ? ListHeaderCheckBoxState.unchecked
              : ListHeaderCheckBoxState.partial,
          );
        } else {
          setIds((previousIds) => [...previousIds, id]);
        }
        break;
      case ListHeaderCheckBoxState.unchecked:
        setIds((previousIds) => [...previousIds, id]);
        setSelectionType(
          ids.length + 1 === totalCount
            ? ListHeaderCheckBoxState.checked
            : ListHeaderCheckBoxState.partial,
        );
        break;
    }
  };

  const toggleSelectAll = () => {
    if (selectionType === ListHeaderCheckBoxState.checked) {
      setSelectionType(ListHeaderCheckBoxState.unchecked);
      setIds([]);
    } else {
      setSelectionType(ListHeaderCheckBoxState.checked);
      setIds(idsList);
    }
  };

  useEffect(() => {
    switch (selectionType) {
      case ListHeaderCheckBoxState.checked:
        if (ids.length < totalCount) {
          setSelectionType(ListHeaderCheckBoxState.partial);
        }
        break;
      case ListHeaderCheckBoxState.partial:
        if (ids.length === totalCount) {
          setSelectionType(ListHeaderCheckBoxState.checked);
        }
        break;
    }
  }, [activeFilters, totalCount, starredFilter, wildcardSearch]);

  const isRowChecked = (id: string) =>
    (selectionType === ListHeaderCheckBoxState.partial && ids.includes(id)) ||
    (selectionType === ListHeaderCheckBoxState.checked && ids.includes(id));

  return {
    ids,
    selectionType,
    isRowChecked,
    toggleSelectAll,
    toggleSelectionById,
  };
};
