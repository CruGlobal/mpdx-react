import { useRouter } from 'next/router';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { omit } from 'lodash';
import {
  ContactFiltersQuery,
  useContactFiltersQuery,
  useContactsQuery,
} from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  coordinatesFromContacts,
  getRedirectPathname,
} from 'pages/accountLists/[accountListId]/contacts/helpers';
import { ContactFilterSetInput } from 'src/graphql/types.generated';
import { useGetIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useDebouncedCallback } from 'src/hooks/useDebounce';
import { useLocale } from 'src/hooks/useLocale';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';
import { useAccountListId } from '../../../hooks/useAccountListId';
import { useMassSelection } from '../../../hooks/useMassSelection';
import { UserOptionFragment } from '../../Shared/Filters/FilterPanel.generated';
import {
  ListHeaderCheckBoxState,
  TableViewModeEnum,
} from '../../Shared/Header/ListHeader';
import { useUpdateUserOptionsMutation } from '../ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import { useGetUserOptionsQuery } from '../ContactFlow/GetUserOptions.generated';
import { Coordinates } from '../ContactsMap/coordinates';

export type ContactsType = {
  accountListId: string | undefined;
  contactId: string | string[] | undefined;
  searchTerm: string | string[] | undefined;
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
  activeFilters: ContactFilterSetInput;
  sanitizedFilters: ContactFilterSetInput;
  setActiveFilters: Dispatch<SetStateAction<ContactFilterSetInput>>;
  starredFilter: ContactFilterSetInput;
  setStarredFilter: (filter: ContactFilterSetInput) => void;
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
  activeFilters: ContactFilterSetInput;
  setActiveFilters: Dispatch<SetStateAction<ContactFilterSetInput>>;
  starredFilter: ContactFilterSetInput;
  setStarredFilter: (filter: ContactFilterSetInput) => void;
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  contactId: string | string[] | undefined;
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
  searchTerm,
  setSearchTerm,
}) => {
  const locale = useLocale();
  const accountListId = useAccountListId() ?? '';
  const router = useRouter();
  const { query, push } = router;

  const [contactDetailsId, setContactDetailsId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<TableViewModeEnum>(
    TableViewModeEnum.List,
  );
  const sanitizedFilters = useMemo(
    () => sanitizeFilters(activeFilters),
    [activeFilters],
  );

  if (contactId !== undefined && !Array.isArray(contactId)) {
    throw new Error('contactId should be an array or undefined');
  }

  //User options for display view
  const { loading: userOptionsLoading } = useGetUserOptionsQuery({
    onCompleted: ({ userOptions }) => {
      if (contactId?.includes('list')) {
        setViewMode(TableViewModeEnum.List);
      } else {
        setViewMode(
          (userOptions.find((option) => option.key === 'contacts_view')
            ?.value as TableViewModeEnum) || TableViewModeEnum.List,
        );
      }
    },
  });

  const contactsFilters = useMemo(
    () => ({
      ...sanitizedFilters,
      ...starredFilter,
      wildcardSearch: searchTerm as string,
      ids:
        viewMode === TableViewModeEnum.Map && activeFilters
          ? activeFilters.ids
          : [],
    }),
    [sanitizedFilters, starredFilter, searchTerm],
  );

  const contactsQueryResult = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters,
      first: contactId?.includes('map') ? 20000 : 25,
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

  useEffect(() => {
    if (contactId) {
      if (!['flows', 'map', 'list'].includes(contactId[contactId.length - 1])) {
        setContactDetailsId(contactId[contactId.length - 1]);
      }
    } else {
      setContactDetailsId(null);
    }
  }, [contactId]);

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

  useEffect(() => {
    if (userOptionsLoading) {
      return;
    }

    setContactFocus(
      contactId &&
        contactId[contactId.length - 1] !== 'flows' &&
        contactId[contactId.length - 1] !== 'list' &&
        contactId[contactId.length - 1] !== 'tour'
        ? contactId[contactId.length - 1]
        : undefined,
    );
  }, [userOptionsLoading, viewMode]);

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
  const setContactFocus = (id: string | undefined) => {
    const {
      accountListId: _accountListId,
      contactId: _contactId,
      ...filteredQuery
    } = query;
    if (viewMode === TableViewModeEnum.Map && ids && ids.length > 0) {
      filteredQuery.filters = encodeURI(JSON.stringify({ ids }));
    }
    if (
      viewMode !== TableViewModeEnum.Map &&
      activeFilters &&
      activeFilters.ids
    ) {
      const newFilters = omit(activeFilters, 'ids');
      if (Object.keys(newFilters).length > 0) {
        filteredQuery.filters = encodeURI(JSON.stringify(newFilters));
      } else {
        delete filteredQuery['filters'];
      }
    }

    const pathname = getRedirectPathname({
      routerPathname: router.pathname,
      accountListId,
      contactId: id,
      viewMode,
    });
    push({
      pathname,
      query: filteredQuery,
    });
    setContactDetailsId(id ?? null);
  };

  const setSearchTermDebounced = useDebouncedCallback(setSearchTerm, 500);

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    view: string,
  ) => {
    setViewMode(view as TableViewModeEnum);
    updateOptions(view);
  };
  //#endregion

  //#region JSX

  const [updateUserOptions] = useUpdateUserOptionsMutation();

  const updateOptions = async (view: string): Promise<void> => {
    await updateUserOptions({
      variables: {
        key: 'contacts_view',
        value: view,
      },
    });
  };

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
        setContactFocus: setContactFocus,
        setSearchTerm: setSearchTermDebounced,
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
        contactDetailsOpen: contactDetailsId !== null,
        contactDetailsId: contactDetailsId ?? undefined,
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
