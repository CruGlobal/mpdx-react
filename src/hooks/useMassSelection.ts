import { useEffect, useState } from 'react';
import { ListHeaderCheckBoxState } from '../components/Shared/Header/ListHeader';
import { useGetIdsForMassSelectionLazyQuery } from './GetIdsForMassSelection.generated';
import { useAccountListId } from './useAccountListId';

export const useMassSelection = (
  totalCount: number,
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

  useEffect(() => {
    if (selectionType === ListHeaderCheckBoxState.checked) {
      setIds(contactIds?.contacts.nodes.map((contact) => contact.id) || []);
    }
  }, [selectionType]);

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

  const [
    getContactIds,
    { data: contactIds, loading: _loadingIds },
  ] = useGetIdsForMassSelectionLazyQuery();
  const accountListId = useAccountListId() ?? '';

  const toggleSelectAll = async () => {
    if (selectionType === ListHeaderCheckBoxState.checked) {
      setSelectionType(ListHeaderCheckBoxState.unchecked);
      setIds([]);
    } else {
      await getContactIds({
        variables: {
          accountListId,
          first: totalCount,
        },
      });
      setSelectionType(ListHeaderCheckBoxState.checked);
    }
  };

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
