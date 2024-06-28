import { useRouter } from 'next/router';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type DebouncedFunc, debounce, omit } from 'lodash';
import {
  ContactFiltersQuery,
  useContactFiltersQuery,
  useContactsQuery,
} from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { PageEnum } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { useUpdateUserOptionsMutation } from 'src/components/Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import { useGetUserOptionsQuery } from 'src/components/Contacts/ContactFlow/GetUserOptions.generated';
import { UserOptionFragment } from 'src/components/Shared/Filters/FilterPanel.generated';
import {
  ListHeaderCheckBoxState,
  TableViewModeEnum,
} from 'src/components/Shared/Header/ListHeader';
import { ContactFilterSetInput } from 'src/graphql/types.generated';
import { useGetIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useMassSelection } from 'src/hooks/useMassSelection';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';

export enum AppealListViewEnum {
  Given = 'given',
  Received = 'received',
  Committed = 'committed',
  Asked = 'asked',
  Excluded = 'excluded',
}

export type AppealsType = {
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
  appealId: string | undefined;
  page: PageEnum | undefined;
  appealListView: AppealListViewEnum;
  setAppealListView: Dispatch<SetStateAction<AppealListViewEnum>>;
};

export const AppealsContext = React.createContext<AppealsType | null>(null);

interface Props {
  children?: React.ReactNode;
  urlFilters?: any;
  activeFilters: ContactFilterSetInput;
  setActiveFilters: Dispatch<SetStateAction<ContactFilterSetInput>>;
  starredFilter: ContactFilterSetInput;
  setStarredFilter: (filter: ContactFilterSetInput) => void;
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  appealId: string | undefined;
  contactId: string | string[] | undefined;
  searchTerm: string | string[] | undefined;
  page?: PageEnum;
}

export const AppealsContextSavedFilters = (
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

export const AppealsProvider: React.FC<Props> = ({
  children,
  urlFilters,
  activeFilters,
  setActiveFilters,
  starredFilter,
  setStarredFilter,
  filterPanelOpen,
  setFilterPanelOpen,
  appealId,
  contactId,
  searchTerm,
  page,
}) => {
  const accountListId = useAccountListId() ?? '';
  const router = useRouter();
  const { query, push, replace, isReady, pathname } = router;

  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [contactDetailsId, setContactDetailsId] = useState<string>();
  const [viewMode, setViewMode] = useState<TableViewModeEnum>(
    TableViewModeEnum.Flows,
  );
  const [appealListView, setAppealListView] = useState<AppealListViewEnum>(
    AppealListViewEnum.Given,
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
    skip: page === PageEnum.InitialPage,
  });

  const contactsFilters = useMemo(
    () => ({
      ...sanitizedFilters,
      ...starredFilter,
      wildcardSearch: searchTerm as string,
      ids: [],
    }),
    [sanitizedFilters, starredFilter, searchTerm],
  );

  const contactsQueryResult = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters,
      first: 25,
    },
    skip: !accountListId || page === PageEnum.InitialPage,
  });
  const { data, loading, fetchMore } = contactsQueryResult;

  //#region Mass Actions

  const contactCount = data?.contacts.totalCount ?? 0;
  const { data: allContacts } = useGetIdsForMassSelectionQuery({
    variables: {
      accountListId,
      first: contactCount,
      contactsFilters,
    },
    skip: contactCount === 0 || page === PageEnum.InitialPage,
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
    contactCount,
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
    if (userOptionsLoading) {
      return;
    }

    setContactFocus(
      contactId &&
        contactId[contactId.length - 1] !== 'flows' &&
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
    skip: !accountListId || page === PageEnum.InitialPage,
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

  const savedFilters: UserOptionFragment[] = AppealsContextSavedFilters(
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
    if (page === PageEnum.InitialPage) {
      return;
    }
    const {
      accountListId: _accountListId,
      contactId: _contactId,
      appealId: _appealId,
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

    let pathname = '';
    pathname = `/accountLists/${accountListId}/tools/appeals`;
    if (appealId) {
      pathname += `/${appealId}`;
    }
    if (viewMode === TableViewModeEnum.Flows) {
      pathname += '/flows';
    } else if (viewMode === TableViewModeEnum.List) {
      pathname += '/list';
    }

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

  return (
    <AppealsContext.Provider
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
        setSearchTerm: setSearchTerm,
        handleViewModeChange: handleViewModeChange,
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
        appealId,
        page,
        appealListView,
        setAppealListView,
      }}
    >
      {children}
    </AppealsContext.Provider>
  );
};
