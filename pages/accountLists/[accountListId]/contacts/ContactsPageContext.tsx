import { ParsedUrlQuery } from 'querystring';
import _, { debounce } from 'lodash';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ContactFilterSetInput } from '../../../../graphql/types.generated';
import { useUpdateUserOptionsMutation } from '../../../../src/components/Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import {
  GetUserOptionsDocument,
  GetUserOptionsQuery,
  useGetUserOptionsQuery,
} from '../../../../src/components/Contacts/ContactFlow/GetUserOptions.generated';
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
import { Coordinates } from './map/map';

export type ContactsPageType = {
  accountListId: string | undefined;
  contactId: string | string[] | undefined;
  searchTerm: string | string[] | undefined;
  loading: boolean;
  query: ParsedUrlQuery;
  selectionType: ListHeaderCheckBoxState;
  isRowChecked: (id: string) => boolean;
  toggleSelectAll: () => void;
  toggleSelectionById: (id: string) => void;
  filterData: ContactFiltersQuery | undefined;
  filtersLoading: boolean;
  toggleFilterPanel: () => void;
  savedFilters: UserOptionFragment[];
  setContactFocus: (
    id?: string | undefined,
    openDetails?: boolean,
    flows?: boolean,
    map?: boolean,
  ) => void;
  setSearchTerm: _.DebouncedFunc<(searchTerm: string) => void>;
  handleViewModeChange: (
    event: React.MouseEvent<HTMLElement>,
    view: string,
  ) => void;
  selected: Coordinates | null | undefined;
  setSelected: Dispatch<SetStateAction<Coordinates | null | undefined>>;
  mapRef: React.MutableRefObject<any>;
  panTo: (coords: {
    lat: number | null | undefined;
    lng: number | null | undefined;
  }) => void;
  mapData: (Coordinates | undefined)[] | undefined;
  activeFilters: ContactFilterSetInput;
  setActiveFilters: Dispatch<SetStateAction<ContactFilterSetInput>>;
  starredFilter: ContactFilterSetInput;
  setStarredFilter: (filter: ContactFilterSetInput) => void;
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  contactDetailsOpen: boolean;
  setContactDetailsOpen: (open: boolean) => void;
  contactDetailsId: string | undefined;
  setContactDetailsId: (id: string) => void;
  viewMode: TableViewModeEnum;
  setViewMode: (mode: TableViewModeEnum) => void;
  urlFilters: any;
  isFiltered: boolean;
  selectedIds: string[];
};

export const ContactsPageContext = React.createContext<ContactsPageType | null>(
  null,
);

export const ContactsPageProvider: React.FC<React.ReactNode> = ({
  children,
}) => {
  const accountListId = useAccountListId();
  const { query, push, replace, isReady, pathname } = useRouter();

  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [contactDetailsId, setContactDetailsId] = useState<string>();
  const [viewMode, setViewMode] = useState<TableViewModeEnum>(
    TableViewModeEnum.List,
  );

  const { contactId, searchTerm } = query;

  if (contactId !== undefined && !Array.isArray(contactId)) {
    throw new Error('contactId should be an array or undefined');
  }

  //#region Filters
  const urlFilters =
    query?.filters && JSON.parse(decodeURI(query.filters as string));

  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<ContactFilterSetInput>(
    urlFilters ?? {},
  );

  const [starredFilter, setStarredFilter] = useState<ContactFilterSetInput>({});

  //User options for display view
  const {
    data: userOptions,
    loading: userOptionsLoading,
  } = useGetUserOptionsQuery({
    onCompleted: () => {
      utilizeViewOption();
    },
  });

  const processView = () => {
    if (contactId?.includes('list')) {
      return TableViewModeEnum.List;
    } else {
      return userOptions?.userOptions.find(
        (option) => option.key === 'contacts_view',
      )?.value as TableViewModeEnum;
    }
  };

  const utilizeViewOption = () => {
    if (userOptionsLoading) return;

    const view = processView();
    setViewMode(view);
    if (view === 'flows' && !contactId?.includes('flows')) {
      setContactFocus(undefined, false, true);
    } else if (view === 'map' && !contactId?.includes('map')) {
      setContactFocus(undefined, false, false, true);
    } else if (
      view !== 'flows' &&
      view !== 'map' &&
      (contactId?.includes('flows') || contactId?.includes('map'))
    ) {
      setContactFocus(undefined, false);
    }
  };

  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: {
        ...activeFilters,
        wildcardSearch: searchTerm as string,
        ...starredFilter,
        ids:
          viewMode === TableViewModeEnum.Map && urlFilters
            ? urlFilters.ids
            : [],
      },
      first: contactId?.includes('map') ? 20000 : 25,
    },
    skip: !accountListId,
  });

  //#region Mass Actions
  const {
    ids,
    selectionType,
    isRowChecked,
    toggleSelectAll,
    toggleSelectionById,
  } = useMassSelection(data?.contacts?.totalCount ?? 0);
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
    utilizeViewOption();
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

  useEffect(() => {
    const { filters: _, ...oldQuery } = query;
    replace({
      pathname,
      query: {
        ...oldQuery,
        ...(Object.keys(activeFilters).length > 0
          ? { filters: encodeURI(JSON.stringify(activeFilters)) }
          : undefined),
      },
    });
  }, [activeFilters]);

  const { data: filterData, loading: filtersLoading } = useContactFiltersQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });

  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  const savedFilters: UserOptionFragment[] =
    filterData?.userOptions.filter(
      (option) =>
        (option.key?.includes('saved_contacts_filter_') ||
          option.key?.includes('graphql_saved_contacts_filter_')) &&
        (JSON.parse(option.value ?? '').account_list_id === accountListId ||
          JSON.parse(option.value ?? '').accountListId === accountListId),
    ) ?? [];

  const isFiltered =
    Object.keys(urlFilters ?? {}).length > 0 ||
    Object.values(urlFilters ?? {}).some((filter) => filter !== []);
  //#endregion

  //#region User Actions
  const setContactFocus = (
    id?: string,
    openDetails = true,
    flows = false,
    map = false,
  ) => {
    const {
      accountListId: _accountListId,
      contactId: _contactId,
      ...filteredQuery
    } = query;
    if (map && ids.length > 0) {
      filteredQuery.filters = encodeURI(JSON.stringify({ ids }));
    }
    if (!map && urlFilters && urlFilters.ids) {
      const newFilters = _.omit(activeFilters, 'ids');
      if (Object.keys(newFilters).length > 0) {
        filteredQuery.filters = encodeURI(JSON.stringify(newFilters));
      } else {
        delete filteredQuery['filters'];
      }
    }
    push(
      id
        ? {
            pathname: `/accountLists/${accountListId}/contacts${
              flows ? '/flows' : map ? '/map' : ''
            }/${id}`,
            query: filteredQuery,
          }
        : {
            pathname: `/accountLists/${accountListId}/contacts/${
              flows ? 'flows/' : map ? 'map/' : ''
            }`,
            query: filteredQuery,
          },
    );
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
    updateOptions(view);
    setContactDetailsOpen(false);
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
      update: (cache, { data: updatedUserOption }) => {
        const query = {
          query: GetUserOptionsDocument,
        };
        const dataFromCache = cache.readQuery<GetUserOptionsQuery>(query);

        if (dataFromCache) {
          const filteredOld = dataFromCache.userOptions.filter(
            (option) => option.key !== 'contacts_view',
          );
          const userOptions = [
            ...filteredOld,
            {
              __typename: 'Option',
              id: updatedUserOption?.createOrUpdateUserOption?.option.id,
              key: 'contacts_view',
              value: view,
            },
          ];
          const data = {
            userOptions,
          };
          cache.writeQuery({ ...query, data });
        }
      },
    });
  };

  // map states and functions
  const [selected, setSelected] = useState<Coordinates | null | undefined>(
    null,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>({});

  const panTo = React.useCallback(({ lat, lng }) => {
    if (mapRef) {
      mapRef?.current?.panTo({ lat, lng });
      mapRef?.current?.setZoom(14);
    }
  }, []);

  const mapData = data?.contacts?.nodes.map((contact) => {
    if (!contact.primaryAddress?.geo) {
      return {
        id: contact.id,
        name: contact.name,
        avatar: contact.avatar,
      };
    }
    const coords = contact.primaryAddress?.geo?.split(',');
    const [lat, lng] = coords;
    return {
      id: contact.id,
      name: contact.name,
      avatar: contact.avatar,
      status: contact.status,
      lat: Number(lat),
      lng: Number(lng),
      street: contact.primaryAddress.street,
      city: contact.primaryAddress.city,
      state: contact.primaryAddress.state,
      country: contact.primaryAddress.country,
      postal: contact.primaryAddress.postalCode,
      source: contact.primaryAddress.source,
      date: `(${DateTime.fromISO(
        contact.primaryAddress.updatedAt,
      ).toLocaleString(DateTime.DATE_SHORT)})`,
    };
  });

  return (
    <ContactsPageContext.Provider
      value={{
        accountListId: accountListId ?? '',
        contactId: contactId,
        searchTerm: searchTerm,
        loading: loading,
        query: query,
        selectionType: selectionType,
        isRowChecked: isRowChecked,
        toggleSelectAll: toggleSelectAll,
        toggleSelectionById: toggleSelectionById,
        filterData: filterData,
        filtersLoading: filtersLoading,
        toggleFilterPanel: toggleFilterPanel,
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
      }}
    >
      {children}
    </ContactsPageContext.Provider>
  );
};
