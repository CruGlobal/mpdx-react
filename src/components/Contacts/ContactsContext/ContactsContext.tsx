import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ContactFiltersQuery,
  useContactFiltersQuery,
  useContactsQuery,
} from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { coordinatesFromContacts } from 'pages/accountLists/[accountListId]/contacts/helpers';
import { useUrlFilters } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { useGetIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useAccountListId } from '../../../hooks/useAccountListId';
import { useMassSelection } from '../../../hooks/useMassSelection';
import { UserOptionFragment } from '../../Shared/Filters/FilterPanel.generated';
import {
  ListHeaderCheckBoxState,
  TableViewModeEnum,
} from '../../Shared/Header/ListHeader';
import { Coordinates } from '../ContactsMap/coordinates';

export type ContactsType = {
  accountListId: string | undefined;
  contactsQueryResult: ReturnType<typeof useContactsQuery>;
  selectionType: ListHeaderCheckBoxState;
  isRowChecked: (id: string) => boolean;
  toggleSelectAll: () => void;
  toggleSelectionById: (id: string) => void;
  filterData: ContactFiltersQuery | undefined;
  filtersLoading: boolean;
  toggleFilterPanel: () => void;
  savedFilters: UserOptionFragment[];
  handleViewModeChange: (
    event: React.MouseEvent<HTMLElement>,
    view: string,
  ) => void;
  selected: Coordinates | null;
  setSelected: Dispatch<SetStateAction<Coordinates | null>>;
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  panTo: (coords: { lat: number; lng: number }) => void;
  mapData: Coordinates[] | undefined;
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  viewMode: TableViewModeEnum | undefined;
  setViewMode: (mode: TableViewModeEnum) => void;
  selectedIds: string[];
  deselectAll: () => void;
  userOptionsLoading: boolean;
};

export const ContactsContext = React.createContext<ContactsType | null>(null);

export interface ContactsContextProps {
  children?: React.ReactNode;
  filterPanelOpen: boolean;
  setFilterPanelOpen: Dispatch<SetStateAction<boolean>>;
  viewMode: TableViewModeEnum;
  setViewMode: Dispatch<SetStateAction<TableViewModeEnum>>;
  userOptionsLoading: boolean;
}

export const ContactsContextSavedFilters = (
  filterData: ContactFiltersQuery | undefined,
  accountListId: string | undefined,
): UserOptionFragment[] => {
  return (
    filterData?.userOptions.filter((option) => {
      let parsedJson: Record<string, string>;
      try {
        parsedJson = JSON.parse(option.value ?? '');
      } catch (e) {
        parsedJson = {};
      }
      return (
        (option.key?.includes('saved_contacts_filter_') ||
          option.key?.includes('graphql_saved_contacts_filter_')) &&
        ((parsedJson.account_list_id === accountListId &&
          !parsedJson.accountListId) ||
          (parsedJson.accountListId === accountListId &&
            !parsedJson.account_list_id))
      );
    }) ?? []
  );
};

export const ContactsProvider: React.FC<ContactsContextProps> = ({
  children,
  filterPanelOpen,
  setFilterPanelOpen,
  viewMode,
  setViewMode,
  userOptionsLoading,
}) => {
  const locale = useLocale();
  const accountListId = useAccountListId() ?? '';

  const { combinedFilters: contactsFilters } = useUrlFilters();

  //#region Mass Actions

  const { data: allContacts, previousData: allContactsPrevious } =
    useGetIdsForMassSelectionQuery({
      variables: {
        accountListId,
        contactsFilters,
      },
    });
  // When the next batch of contact ids is loading, use the previous batch of contact ids in the
  // meantime to avoid throwing out the selected contact ids.
  const allContactIds = useMemo(
    () =>
      (allContacts ?? allContactsPrevious)?.contacts.nodes.map(
        (contact) => contact.id,
      ) ?? [],
    [allContacts, allContactsPrevious],
  );

  const {
    ids,
    selectionType,
    isRowChecked,
    toggleSelectAll,
    toggleSelectionById,
    deselectAll,
  } = useMassSelection(allContactIds);
  //#endregion

  const contactsQueryResult = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters:
        // In the map view, ignore all filters and only show the selected contacts
        // If no contacts were selected, show all contacts
        viewMode === TableViewModeEnum.Map
          ? { ids: ids.length ? ids : undefined }
          : contactsFilters,
      first: viewMode === TableViewModeEnum.Map ? 20000 : 25,
    },
    skip: !accountListId,
  });
  const { data, fetchMore } = contactsQueryResult;

  // Load all pages of contacts on the map view
  useEffect(() => {
    if (
      viewMode === TableViewModeEnum.Map &&
      data?.contacts.pageInfo.hasNextPage
    ) {
      fetchMore({
        variables: {
          after: data.contacts.pageInfo.endCursor,
        },
      });
    }
  }, [data, viewMode]);

  const { data: filterData, loading: filtersLoading } = useContactFiltersQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
    context: {
      doNotBatch: true,
    },
  });

  const toggleFilterPanel = useCallback(() => {
    setFilterPanelOpen((open) => !open);
  }, [setFilterPanelOpen]);

  const savedFilters: UserOptionFragment[] = useMemo(
    () => ContactsContextSavedFilters(filterData, accountListId),
    [filterData, accountListId],
  );
  //#endregion

  //#region User Actions

  const handleViewModeChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, view: string) => {
      setViewMode(view as TableViewModeEnum);
    },
    [setViewMode],
  );
  //#endregion

  //#region JSX

  // map states and functions
  const [selected, setSelected] = useState<Coordinates | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<google.maps.Map | null>(null);

  const panTo = useCallback(({ lat, lng }) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(14);
    }
  }, []);

  const mapData = useMemo(
    () => data && coordinatesFromContacts(data.contacts, locale),
    [data],
  );

  const contextValue = useMemo(
    () => ({
      accountListId: accountListId ?? '',
      contactsQueryResult,
      selectionType,
      isRowChecked,
      toggleSelectAll,
      toggleSelectionById,
      selectedIds: ids,
      deselectAll,
      filterData,
      filtersLoading,
      toggleFilterPanel,
      savedFilters,
      handleViewModeChange,
      selected,
      setSelected,
      mapRef,
      mapData,
      panTo,
      filterPanelOpen,
      setFilterPanelOpen,
      viewMode,
      setViewMode,
      userOptionsLoading,
    }),
    [
      accountListId,
      contactsQueryResult,
      selectionType,
      isRowChecked,
      toggleSelectAll,
      toggleSelectionById,
      ids,
      deselectAll,
      filterData,
      filtersLoading,
      toggleFilterPanel,
      savedFilters,
      handleViewModeChange,
      selected,
      setSelected,
      mapData,
      panTo,
      filterPanelOpen,
      setFilterPanelOpen,
      viewMode,
      setViewMode,
      userOptionsLoading,
    ],
  );

  return (
    <ContactsContext.Provider value={contextValue}>
      {children}
    </ContactsContext.Provider>
  );
};
