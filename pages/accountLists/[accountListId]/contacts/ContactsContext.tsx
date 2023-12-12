import { NextRouter, useRouter } from 'next/router';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type DebouncedFunc, debounce, omit } from 'lodash';
import { ContactFilterSetInput } from 'src/graphql/types.generated';
import { useGetIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useLocale } from 'src/hooks/useLocale';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';
import { useUpdateUserOptionsMutation } from '../../../../src/components/Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import { useGetUserOptionsQuery } from '../../../../src/components/Contacts/ContactFlow/GetUserOptions.generated';
import { UserOptionFragment } from '../../../../src/components/Shared/Filters/FilterPanel.generated';
import {
  ListHeaderCheckBoxState,
  TableViewModeEnum,
} from '../../../../src/components/Shared/Header/ListHeader';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import { useMassSelection } from '../../../../src/hooks/useMassSelection';
import {
  ContactFiltersQuery,
  useContactFiltersQuery,
  useContactsQuery,
} from './Contacts.generated';
import { coordinatesFromContacts, getRedirectPathname } from './helpers';
import { Coordinates } from './map/map';

export type ContactsType = {
  accountListId: string | undefined;
  contactId: string | string[] | undefined;
  searchTerm: string | string[] | undefined;
  loading: boolean;
  router: NextRouter;
  selectionType: ListHeaderCheckBoxState;
  isRowChecked: (id: string) => boolean;
  toggleSelectAll: () => void;
  toggleSelectionById: (id: string) => void;
  filterData: ContactFiltersQuery | undefined;
  filtersLoading: boolean;
  toggleFilterPanel: () => void;
  handleClearAll: () => void;
  savedFilters: UserOptionFragment[];
  setContactFocus: (
    id?: string | undefined,
    openDetails?: boolean,
    flows?: boolean,
    map?: boolean,
  ) => void;
  setSearchTerm: DebouncedFunc<(searchTerm: string) => void>;
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
  setContactDetailsOpen: (open: boolean) => void;
  contactDetailsId: string | undefined;
  setContactDetailsId: (id: string) => void;
  viewMode: TableViewModeEnum | undefined;
  setViewMode: (mode: TableViewModeEnum) => void;
  urlFilters: any;
  isFiltered: boolean;
  selectedIds: string[];
  deselectAll: () => void;
  userOptionsLoading: boolean;
};

export const ContactsContext = React.createContext<ContactsType | null>(null);

interface Props {
  children?: React.ReactNode;
  urlFilters?: any;
  activeFilters: ContactFilterSetInput;
  setActiveFilters: Dispatch<SetStateAction<ContactFilterSetInput>>;
  starredFilter: ContactFilterSetInput;
  setStarredFilter: (filter: ContactFilterSetInput) => void;
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  contactId: string | string[] | undefined;
  searchTerm: string | string[] | undefined;
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

export const ContactsProvider: React.FC<Props> = ({
  children,
  urlFilters,
  activeFilters,
  setActiveFilters,
  starredFilter,
  setStarredFilter,
  filterPanelOpen,
  setFilterPanelOpen,
  contactId,
  searchTerm,
}) => {
  const locale = useLocale();
  const accountListId = useAccountListId() ?? '';
  const router = useRouter();
  const { query, push, replace, isReady, pathname } = router;

  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [contactDetailsId, setContactDetailsId] = useState<string>();
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
        viewMode === TableViewModeEnum.Map && urlFilters ? urlFilters.ids : [],
    }),
    [sanitizedFilters, starredFilter, searchTerm],
  );

  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters,
      first: contactId?.includes('map') ? 20000 : 25,
    },
    skip: !accountListId,
  });

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
  } = useMassSelection(
    data?.contacts?.totalCount ?? 0,
    allContactIds,
    activeFilters,
    searchTerm as string,
    starredFilter,
  );
  //#endregion

  useEffect(() => {
    if (isReady && contactId) {
      if (
        contactId[contactId.length - 1] !== 'flows' &&
        contactId[contactId.length - 1] !== 'map' &&
        contactId[contactId.length - 1] !== 'list'
      ) {
        setContactDetailsId(contactId[contactId.length - 1]);
        setContactDetailsOpen(true);
      }
    } else if (isReady && !contactId) {
      setContactDetailsId('');
      setContactDetailsOpen(false);
    }
  }, [isReady, contactId]);

  useEffect(() => {
    if (userOptionsLoading) return;

    setContactFocus(
      contactId &&
        contactId[contactId.length - 1] !== 'flows' &&
        contactId[contactId.length - 1] !== 'map' &&
        contactId[contactId.length - 1] !== 'list'
        ? contactId[contactId.length - 1]
        : undefined,
      contactId ? true : false,
    );
    if (!loading && viewMode === TableViewModeEnum.Map) {
      if (data?.contacts.pageInfo.hasNextPage) {
        fetchMore({
          variables: {
            after: data.contacts?.pageInfo.endCursor,
          },
        });
      }
    }
  }, [loading, viewMode]);

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

  const isFiltered =
    Object.keys(urlFilters ?? {}).length > 0 ||
    Object.values(urlFilters ?? {}).some(
      (filter) => filter !== ([] as Array<string>),
    );
  //#endregion

  //#region User Actions
  const setContactFocus = (id?: string, openDetails = true) => {
    const {
      accountListId: _accountListId,
      contactId: _contactId,
      ...filteredQuery
    } = query;
    if (viewMode === TableViewModeEnum.Map && ids && ids.length > 0) {
      filteredQuery.filters = encodeURI(JSON.stringify({ ids }));
    }
    if (viewMode !== TableViewModeEnum.Map && urlFilters && urlFilters.ids) {
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
    if (openDetails) {
      id && setContactDetailsId(id);
      setContactDetailsOpen(!!id);
    }
  };
  const setSearchTerm = useCallback(
    debounce((searchTerm: string) => {
      const { searchTerm: _, ...oldQuery } = query;
      if (searchTerm !== '') {
        replace({
          pathname,
          query: {
            ...oldQuery,
            accountListId,
            ...(searchTerm && { searchTerm }),
          },
        });
      } else {
        replace({
          pathname,
          query: {
            ...oldQuery,
            accountListId,
          },
        });
      }
    }, 500),
    [accountListId],
  );

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
        loading: loading,
        router: router,
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
        setSearchTerm: setSearchTerm,
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
        contactDetailsOpen: contactDetailsOpen,
        setContactDetailsOpen: setContactDetailsOpen,
        contactDetailsId: contactDetailsId,
        setContactDetailsId: setContactDetailsId,
        viewMode: viewMode,
        setViewMode: setViewMode,
        urlFilters: urlFilters,
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
