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
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import { useGetIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useUserPreference } from 'src/hooks/useUserPreference';
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
  contactId: string | string[] | undefined;
  contactsQueryResult: ReturnType<typeof useContactsQuery>;
  selectionType: ListHeaderCheckBoxState;
  isRowChecked: (id: string) => boolean;
  toggleSelectAll: () => void;
  toggleSelectionById: (id: string) => void;
  filterData: ContactFiltersQuery | undefined;
  filtersLoading: boolean;
  toggleFilterPanel: () => void;
  handleClearAll: () => void;
  savedFilters: UserOptionFragment[];
  setContactFocus: (id: string | undefined) => void;
  handleViewModeChange: (
    event: React.MouseEvent<HTMLElement>,
    view: string,
  ) => void;
  selected: Coordinates | null;
  setSelected: Dispatch<SetStateAction<Coordinates | null>>;
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  panTo: (coords: { lat: number; lng: number }) => void;
  mapData: Coordinates[] | undefined;
  activeFilters: ContactFilterSetInput & TaskFilterSetInput;
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  contactDetailsOpen: boolean;
  contactDetailsId: string | undefined;
  viewMode: TableViewModeEnum | undefined;
  setViewMode: (mode: TableViewModeEnum) => void;
  isFiltered: boolean;
  selectedIds: string[];
  deselectAll: () => void;
  userOptionsLoading: boolean;
};

export const ContactsContext = React.createContext<ContactsType | null>(null);

export interface ContactsContextProps {
  children?: React.ReactNode;
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  viewMode: TableViewModeEnum;
  setViewMode: Dispatch<SetStateAction<TableViewModeEnum>>;
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
}) => {
  const locale = useLocale();
  const accountListId = useAccountListId() ?? '';

  const [contactsView, saveContactsView, { loading: userOptionsLoading }] =
    useUserPreference({
      key: 'contacts_view',
      defaultValue: TableViewModeEnum.List,
    });
  useEffect(() => {
    if (contactsView) {
      setViewMode(contactsView);
    }
  }, [contactsView]);

  const { activeFilters, setActiveFilters, searchTerm, setSearchTerm } =
    useUrlFilters();

  const contactsFilters = useMemo(
    () => ({
      ...activeFilters,
      wildcardSearch: searchTerm,
    }),
    [activeFilters, searchTerm],
  );

  const contactsQueryResult = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters,
      first: viewMode === TableViewModeEnum.Map ? 20000 : 25,
    },
    skip: !accountListId,
  });
  const { data, fetchMore } = contactsQueryResult;

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

  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  const handleClearAll = () => {
    setSearchTerm('');
  };

  const savedFilters: UserOptionFragment[] = ContactsContextSavedFilters(
    filterData,
    accountListId,
  );

  const isFiltered = Object.keys(activeFilters).length > 0;

  //#endregion

  //#region User Actions

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    view: string,
  ) => {
    const newViewMode = view as TableViewModeEnum;
    saveContactsView(newViewMode);
    if (newViewMode === TableViewModeEnum.Map && ids.length) {
      // When switching to the map, make the filter only show the selected contacts, if any
      setActiveFilters({ ...activeFilters, ids });
    }
  };
  //#endregion

  //#region JSX

  // map states and functions
  const [selected, setSelected] = useState<Coordinates | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<google.maps.Map | null>(null);

  const panTo = useCallback(
    ({ lat, lng }) => {
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(14);
      }
    },
    [mapRef.current],
  );

  const mapData = useMemo(
    () => data && coordinatesFromContacts(data.contacts, locale),
    [data],
  );

  return (
    <ContactsContext.Provider
      value={{
        accountListId: accountListId ?? '',
        contactId: undefined,
        contactsQueryResult: contactsQueryResult,
        selectionType: selectionType,
        isRowChecked: isRowChecked,
        toggleSelectAll: toggleSelectAll,
        toggleSelectionById: toggleSelectionById,
        filterData: filterData,
        filtersLoading: filtersLoading,
        toggleFilterPanel: toggleFilterPanel,
        handleClearAll: handleClearAll,
        savedFilters: savedFilters,
        setContactFocus: () => {},
        handleViewModeChange: handleViewModeChange,
        selected: selected,
        setSelected: setSelected,
        mapRef: mapRef,
        mapData: mapData,
        panTo: panTo,
        activeFilters: activeFilters,
        filterPanelOpen: filterPanelOpen,
        setFilterPanelOpen: setFilterPanelOpen,
        contactDetailsOpen: false,
        contactDetailsId: undefined,
        viewMode: viewMode,
        setViewMode: setViewMode,
        isFiltered: isFiltered,
        selectedIds: ids,
        deselectAll: deselectAll,
        userOptionsLoading: userOptionsLoading,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
};
