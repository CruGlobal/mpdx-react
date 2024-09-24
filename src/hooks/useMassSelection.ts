import { useEffect, useState } from 'react';
import {
  ContactFilterSetInput,
  ReportContactFilterSetInput,
} from 'src/graphql/types.generated';
import { ListHeaderCheckBoxState } from '../components/Shared/Header/ListHeader';

export const useMassSelection = (
  totalCount: number,
  idsList: string[],
  activeFilters?: ContactFilterSetInput | ReportContactFilterSetInput,
  wildcardSearch?: string,
  starredFilter?: ContactFilterSetInput,
): {
  ids: string[];
  selectionType: ListHeaderCheckBoxState;
  isRowChecked: (id: string) => boolean;
  deselectAll: () => void;
  toggleSelectAll: () => void;
  toggleSelectionById: (id: string) => void;
  selectMultipleIds: (ids: string[]) => void;
  deselectMultipleIds: (ids: string[]) => void;
  deselectIds: (idsToRemove: string[]) => void;
} => {
  const [selectionType, setSelectionType] = useState(
    ListHeaderCheckBoxState.Unchecked,
  );
  const [ids, setIds] = useState<string[]>([]);

  const toggleSelectionById = (id: string) => {
    switch (selectionType) {
      case ListHeaderCheckBoxState.Partial:
        if (ids.includes(id)) {
          setIds((previousIds) =>
            previousIds.filter((selectedIds) => selectedIds !== id),
          );
          if (ids.length - 1 === 0) {
            setSelectionType(ListHeaderCheckBoxState.Unchecked);
          }
        } else {
          setIds((previousIds) => [...previousIds, id]);
          if (ids.length + 1 === totalCount) {
            setSelectionType(ListHeaderCheckBoxState.Checked);
          }
        }
        break;
      case ListHeaderCheckBoxState.Checked:
        if (ids.includes(id)) {
          setIds((previousIds) =>
            previousIds.filter((previousId) => previousId !== id),
          );
          setSelectionType(
            ids.length - 1 === 0
              ? ListHeaderCheckBoxState.Unchecked
              : ListHeaderCheckBoxState.Partial,
          );
        } else {
          setIds((previousIds) => [...previousIds, id]);
        }
        break;
      case ListHeaderCheckBoxState.Unchecked:
        setIds((previousIds) => [...previousIds, id]);
        setSelectionType(
          ids.length + 1 === totalCount
            ? ListHeaderCheckBoxState.Checked
            : ListHeaderCheckBoxState.Partial,
        );
        break;
    }
  };

  const selectMultipleIds = (newIds: string[]) => {
    setSelectionType(ListHeaderCheckBoxState.Checked);
    setIds([...ids, ...newIds]);
  };

  const deselectMultipleIds = (idsToRemove: string[]) => {
    setSelectionType(ListHeaderCheckBoxState.Unchecked);
    setIds(ids.filter((id) => !idsToRemove.includes(id)));
  };

  const deselectAll = () => {
    setSelectionType(ListHeaderCheckBoxState.Unchecked);
    setIds([]);
  };

  const toggleSelectAll = () => {
    if (selectionType === ListHeaderCheckBoxState.Checked) {
      setSelectionType(ListHeaderCheckBoxState.Unchecked);
      setIds([]);
    } else {
      setSelectionType(ListHeaderCheckBoxState.Checked);
      setIds(idsList);
    }
  };

  const deselectIds = (idsToRemove: string[]) => {
    setIds(ids.filter((id) => !idsToRemove.includes(id)));
  };

  useEffect(() => {
    switch (selectionType) {
      case ListHeaderCheckBoxState.Checked:
        if (ids.length < totalCount) {
          setSelectionType(ListHeaderCheckBoxState.Partial);
        }
        break;
      case ListHeaderCheckBoxState.Partial:
        if (ids.length === totalCount) {
          setSelectionType(ListHeaderCheckBoxState.Checked);
        }
        break;
    }
  }, [activeFilters, totalCount, starredFilter, wildcardSearch]);

  const isRowChecked = (id: string) =>
    (selectionType === ListHeaderCheckBoxState.Partial && ids.includes(id)) ||
    (selectionType === ListHeaderCheckBoxState.Checked && ids.includes(id));

  return {
    ids,
    selectionType,
    isRowChecked,
    deselectAll,
    toggleSelectAll,
    toggleSelectionById,
    selectMultipleIds,
    deselectMultipleIds,
    deselectIds,
  };
};
