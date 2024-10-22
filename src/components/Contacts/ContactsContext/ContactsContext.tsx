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
import { GetContactHrefObject } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { coordinatesFromContacts } from 'pages/accountLists/[accountListId]/contacts/helpers';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import { useGetIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useDebouncedCallback } from 'src/hooks/useDebounce';
import { useLocale } from 'src/hooks/useLocale';
import { useUserPreference } from 'src/hooks/useUserPreference';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';
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
  searchTerm: string;
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
  getContactHrefObject: GetContactHrefObject;
  setSearchTerm: (searchTerm: string) => void;
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
  sanitizedFilters: ContactFilterSetInput & TaskFilterSetInput;
  setActiveFilters: (
    filters: ContactFilterSetInput & TaskFilterSetInput,
  ) => void;
  starredFilter: ContactFilterSetInput & TaskFilterSetInput;
  setStarredFilter: (
    filter: ContactFilterSetInput & TaskFilterSetInput,
  ) => void;
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
  activeFilters: ContactFilterSetInput & TaskFilterSetInput;
  setActiveFilters: (
    filters: ContactFilterSetInput & TaskFilterSetInput,
  ) => void;
  starredFilter: ContactFilterSetInput & TaskFilterSetInput;
  setStarredFilter: (
    filter: ContactFilterSetInput & TaskFilterSetInput,
  ) => void;
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  contactId: string | undefined;
  setContactId: Dispatch<SetStateAction<string | undefined>>;
  getContactHrefObject: GetContactHrefObject;
  viewMode?: TableViewModeEnum;
  setViewMode?: Dispatch<SetStateAction<TableViewModeEnum>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
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
  activeFilters,
  setActiveFilters,
  starredFilter,
  setStarredFilter,
  filterPanelOpen,
  setFilterPanelOpen,
  contactId,
  setContactId,
  getContactHrefObject,
  viewMode = TableViewModeEnum.List,
  setViewMode = () => {},
  searchTerm,
  setSearchTerm,
}) => {
  const locale = useLocale();
  const accountListId = useAccountListId() ?? '';

  const sanitizedFilters = useMemo(
    () => sanitizeFilters(activeFilters),
    [activeFilters],
  );

  const [contactsView, updateOptions, { loading: userOptionsLoading }] =
    useUserPreference({
      key: 'contacts_view',
      defaultValue: TableViewModeEnum.List,
    });
  useEffect(() => {
    if (contactsView) {
      setViewMode(contactsView);
    }
  }, [contactsView]);

  const contactsFilters = useMemo(() => {
    // Remove filters in the map view
    const viewFilters =
      viewMode === TableViewModeEnum.Map
        ? { ids: sanitizedFilters.ids }
        : sanitizedFilters;
    return {
      ...viewFilters,
      ...starredFilter,
      wildcardSearch: searchTerm as string,
    };
  }, [sanitizedFilters, viewMode, starredFilter, searchTerm]);

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

  const contactCount = data?.contacts.totalCount ?? 0;
  const { data: allContacts } = useGetIdsForMassSelectionQuery({
    variables: {
      accountListId,
      first: contactCount,
      contactsFilters,
    },
    skip: contactCount === 0,
  });
  const allContactIds = useMemo(
    () => allContacts?.contacts.nodes.map((contact) => contact.id) ?? [],
    [allContacts],
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

  const setSearchTermDebounced = useDebouncedCallback(setSearchTerm, 500);

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    view: string,
  ) => {
    setViewMode(view as TableViewModeEnum);
    updateOptions(view as TableViewModeEnum);
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
        contactId: contactId,
        searchTerm: searchTerm,
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
        setContactFocus: setContactId,
        setSearchTerm: setSearchTermDebounced,
        getContactHrefObject: getContactHrefObject,
        handleViewModeChange: handleViewModeChange,
        selected: selected,
        setSelected: setSelected,
        mapRef: mapRef,
        mapData: mapData,
        panTo: panTo,
        activeFilters: activeFilters,
        sanitizedFilters,
        setActiveFilters: setActiveFilters,
        starredFilter: starredFilter,
        setStarredFilter: setStarredFilter,
        filterPanelOpen: filterPanelOpen,
        setFilterPanelOpen: setFilterPanelOpen,
        contactDetailsOpen: contactId !== undefined,
        contactDetailsId: contactId,
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
