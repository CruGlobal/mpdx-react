import { ParsedUrlQueryInput } from 'querystring';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce, omit } from 'lodash';
import { useContactFiltersQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { PageEnum } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { useGetUserOptionsQuery } from 'src/components/Contacts/ContactFlow/GetUserOptions.generated';
import {
  ContactsContextSavedFilters as AppealsContextSavedFilters,
  ContactsContextProps,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { UserOptionFragment } from 'src/components/Shared/Filters/FilterPanel.generated';
import { useUrlFilters } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { useGetIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useUpdateUserOptionMutation } from 'src/hooks/UserPreference.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useMassSelection } from 'src/hooks/useMassSelection';
import { useContactsQuery } from './contacts.generated';
import { useContactsCountQuery } from './contactsCount.generated';

export enum AppealStatusEnum {
  Excluded = 'excluded',
  Asked = 'asked',
  NotReceived = 'not_received',
  ReceivedNotProcessed = 'received_not_processed',
  Processed = 'processed',
}

export enum TableViewModeEnum {
  List = 'list',
  Flows = 'flows',
}

export const shouldSkipContactCount = (tour, filterPanelOpen, viewMode) => {
  if (viewMode === TableViewModeEnum.Flows) {
    return true;
  } else if (viewMode === TableViewModeEnum.List && !filterPanelOpen) {
    if (!tour) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

type ContactUrl = {
  pathname: string;
  filteredQuery: string | ParsedUrlQueryInput;
  contactUrl: string;
};
export interface AppealsType
  extends Omit<
    ContactsType,
    | 'selected'
    | 'setSelected'
    | 'mapRef'
    | 'panTo'
    | 'mapData'
    | 'contactsQueryResult'
    | 'setContactFocus'
    | 'setViewMode'
    | 'getContactHrefObject'
  > {
  selectMultipleIds: (ids: string[]) => void;
  deselectMultipleIds: (ids: string[]) => void;
  setViewMode: (mode: TableViewModeEnum) => void;
  setContactFocus: (id: string | undefined) => void;
  getContactUrl: (id?: string, endTour?: boolean) => ContactUrl;
  contactsQueryResult: ReturnType<typeof useContactsQuery>;
  appealId: string | undefined;
  page: PageEnum | undefined;
  tour: AppealTourEnum | null;
  nextTourStep: () => void;
  hideTour: () => void;
  askedCountQueryResult: ReturnType<typeof useContactsCountQuery>;
  excludedCountQueryResult: ReturnType<typeof useContactsCountQuery>;
  committedCountQueryResult: ReturnType<typeof useContactsCountQuery>;
  givenCountQueryResult: ReturnType<typeof useContactsCountQuery>;
  receivedCountQueryResult: ReturnType<typeof useContactsCountQuery>;
}

export const AppealsContext = React.createContext<AppealsType | null>(null);

export enum AppealTourEnum {
  Start = 'start',
  ReviewExcluded = 'reviewExcluded',
  ReviewAsked = 'reviewAsked',
  ExportContacts = 'exportContacts',
  Finish = 'finish',
}
export interface AppealsContextProps
  extends Omit<ContactsContextProps, 'contactId' | 'getContactUrl'> {
  contactId: string | string[] | undefined;
  appealId: string | undefined;
  page?: PageEnum;
}

export const AppealsProvider: React.FC<AppealsContextProps> = ({
  children,
  filterPanelOpen,
  setFilterPanelOpen,
  appealId,
  contactId,
  page,
}) => {
  const accountListId = useAccountListId() ?? '';
  const router = useRouter();
  const { query, push, replace, pathname } = router;

  const [contactDetailsId, setContactDetailsId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<TableViewModeEnum>(
    TableViewModeEnum.Flows,
  );
  const [tour, setTour] = useState<AppealTourEnum | null>(null);

  const { activeFilters, setActiveFilters, searchTerm, combinedFilters } =
    useUrlFilters();

  if (contactId !== undefined && !Array.isArray(contactId)) {
    throw new Error('contactId should be an array or undefined');
  }

  //User options for display view
  const { loading: userOptionsLoading } = useGetUserOptionsQuery({
    onCompleted: ({ userOptions }) => {
      const defaultView =
        (userOptions.find((option) => option.key === 'contacts_view')
          ?.value as TableViewModeEnum) || TableViewModeEnum.Flows;
      if (
        contactId?.includes('list') ||
        defaultView === TableViewModeEnum.List
      ) {
        setViewMode(TableViewModeEnum.List);
        setFilterPanelOpen(true);
        // Default to showing the asked contacts
        if (!activeFilters.appealStatus) {
          setActiveFilters({
            appealStatus: AppealStatusEnum.Asked,
          });
        }
      } else {
        setViewMode(defaultView);
      }
    },
  });

  const contactsFilters = useMemo(
    () => ({
      ...combinedFilters,
      appeal: [appealId || ''],
    }),
    [combinedFilters, appealId],
  );

  const contactsQueryResult = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters,
      first: 25,
    },
    skip: !accountListId,
  });

  //#region Mass Actions

  const { data: allContacts, previousData: allContactsPrevious } =
    useGetIdsForMassSelectionQuery({
      variables: {
        accountListId,
        contactsFilters,
      },
    });
  // In the flows view, we need the total count of all contacts in every column, but the API
  // filters out contacts excluded from an appeal. We have to load excluded contacts also and
  // manually merge them with the other contacts.
  const inFlowsView = viewMode === TableViewModeEnum.Flows;
  const {
    data: allExcludedContacts,
    previousData: allExcludedContactsPrevious,
  } = useGetIdsForMassSelectionQuery({
    variables: {
      accountListId,
      contactsFilters: { ...contactsFilters, appealStatus: 'excluded' },
    },
    // Only load this query in the flows view
    skip: !inFlowsView,
  });
  // When the next batch of contact ids is loading, use the previous batch of contact ids in the
  // meantime to avoid throwing out the selected contact ids.
  const allContactIds = useMemo(() => {
    const regularContacts =
      (allContacts ?? allContactsPrevious)?.contacts.nodes ?? [];
    const excludedContacts =
      (allExcludedContacts ?? allExcludedContactsPrevious)?.contacts.nodes ??
      [];

    // Only merge in the excluded contacts in the flows view
    return [...regularContacts, ...(inFlowsView ? excludedContacts : [])].map(
      (contact) => contact.id,
    );
  }, [
    allContacts,
    allContactsPrevious,
    allExcludedContacts,
    allExcludedContactsPrevious,
  ]);

  const {
    ids,
    selectionType,
    isRowChecked,
    toggleSelectAll,
    toggleSelectionById,
    deselectAll,
    selectMultipleIds,
    deselectMultipleIds,
  } = useMassSelection(allContactIds);
  //#endregion

  useEffect(() => {
    if (contactId) {
      if (
        contactId[contactId.length - 1] !== 'flows' &&
        contactId[contactId.length - 1] !== 'list' &&
        contactId[contactId.length - 1] !== 'tour'
      ) {
        setContactDetailsId(contactId[contactId.length - 1]);
      }
      if (contactId.includes('tour') && !tour) {
        setTour(AppealTourEnum.Start);
      }
    } else {
      setContactDetailsId(null);
    }
  }, [contactId]);

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
      contactId ? true : false,
    );
  }, [viewMode]);

  const { data: filterData, loading: filtersLoading } = useContactFiltersQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
    context: {
      doNotBatch: true,
    },
  });

  const nameSearch = searchTerm ? { wildcardSearch: searchTerm as string } : {};
  const defaultFilters = {
    appeal: [appealId || ''],
    ...nameSearch,
  };
  const skip = shouldSkipContactCount(tour, filterPanelOpen, viewMode);

  const askedCountQueryResult = useContactsCountQuery({
    variables: {
      accountListId: accountListId || '',
      contactsFilter: {
        ...defaultFilters,
        appealStatus: AppealStatusEnum.Asked,
      },
    },
    skip,
  });

  const excludedCountQueryResult = useContactsCountQuery({
    variables: {
      accountListId: accountListId || '',
      contactsFilter: {
        ...defaultFilters,
        appealStatus: AppealStatusEnum.Excluded,
      },
    },
    skip,
  });

  const committedCountQueryResult = useContactsCountQuery({
    variables: {
      accountListId: accountListId || '',
      contactsFilter: {
        ...defaultFilters,
        appealStatus: AppealStatusEnum.NotReceived,
      },
    },
    skip,
  });

  const givenCountQueryResult = useContactsCountQuery({
    variables: {
      accountListId: accountListId || '',
      contactsFilter: {
        ...defaultFilters,
        appealStatus: AppealStatusEnum.Processed,
      },
    },
    skip,
  });

  const receivedCountQueryResult = useContactsCountQuery({
    variables: {
      accountListId: accountListId || '',
      contactsFilter: {
        ...defaultFilters,
        appealStatus: AppealStatusEnum.ReceivedNotProcessed,
      },
    },
    skip,
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

  const isFiltered = Object.keys(activeFilters).length > 0;
  //#endregion

  //#region User Actions

  const getContactUrl = (id?: string, endTour = false) => {
    const {
      accountListId: _accountListId,
      contactId: _contactId,
      appealId: _appealId,
      ...filteredQuery
    } = query;
    if (activeFilters && activeFilters.ids) {
      const newFilters = omit(activeFilters, 'ids');
      if (Object.keys(newFilters).length > 0) {
        filteredQuery.filters = encodeURI(JSON.stringify(newFilters));
      } else {
        delete filteredQuery['filters'];
      }
    }

    let pathname = '';
    pathname = `/accountLists/${accountListId}/tools/appeals/appeal`;
    if (appealId) {
      pathname += `/${appealId}`;
    }
    if (viewMode === TableViewModeEnum.Flows) {
      pathname += '/flows';
    } else if (viewMode === TableViewModeEnum.List) {
      pathname += '/list';
    }
    if (tour && !endTour) {
      pathname += '/tour';
    }
    if (id) {
      pathname += `/${id}`;
    }

    const filterParams =
      Object.keys(filteredQuery).length > 0
        ? `?${new URLSearchParams(
            filteredQuery as Record<string, string>,
          ).toString()}`
        : '';

    return {
      pathname,
      filteredQuery,
      contactUrl: pathname + filterParams,
    };
  };
  const setContactFocus = (id?: string, endTour = false) => {
    const { pathname, filteredQuery } = getContactUrl(id, endTour);
    push({
      pathname,
      query: filteredQuery,
    });
    setContactDetailsId(id ?? null);
  };
  const setSearchTerm = useCallback(
    debounce((searchTerm: string) => {
      const { searchTerm: _, ...oldQuery } = query;
      if (searchTerm !== '') {
        replace(
          {
            pathname,
            query: {
              ...oldQuery,
              accountListId,
              ...(searchTerm && { searchTerm }),
            },
          },
          undefined,
          { shallow: true },
        );
      } else {
        replace(
          {
            pathname,
            query: {
              ...oldQuery,
              accountListId,
            },
          },
          undefined,
          { shallow: true },
        );
      }
    }, 500),
    [accountListId],
  );

  const handleViewModeChange = (_, view: string) => {
    setViewMode(view as TableViewModeEnum);
    updateOptions(view);
    if (view === TableViewModeEnum.List) {
      setFilterPanelOpen(true);
      setActiveFilters({
        appealStatus: AppealStatusEnum.Asked,
      });
    } else {
      setActiveFilters({});
    }
  };
  //#endregion

  //#region JSX

  const [updateUserOption] = useUpdateUserOptionMutation();

  const updateOptions = async (view: string): Promise<void> => {
    await updateUserOption({
      variables: {
        key: 'contacts_view',
        value: view,
      },
    });
  };

  const nextTourStep = () => {
    switch (tour) {
      case AppealTourEnum.Start:
        setTour(AppealTourEnum.ReviewExcluded);
        setActiveFilters({
          appealStatus: AppealStatusEnum.Excluded,
        });
        break;
      case AppealTourEnum.ReviewExcluded:
        setTour(AppealTourEnum.ReviewAsked);
        setActiveFilters({
          appealStatus: AppealStatusEnum.Asked,
        });
        break;
      case AppealTourEnum.ReviewAsked:
        setFilterPanelOpen(true);
        setTour(AppealTourEnum.ExportContacts);
        setActiveFilters({
          appealStatus: AppealStatusEnum.Asked,
        });
        deselectAll();
        toggleSelectAll();
        break;
      case AppealTourEnum.ExportContacts:
        setTour(AppealTourEnum.Finish);
        setActiveFilters({
          appealStatus: AppealStatusEnum.Asked,
        });
        break;
      default:
        setTour(null);
        // Need to remove tour from URL
        setContactFocus(undefined, true);
        break;
    }
  };
  const hideTour = () => {
    setTour(null);
    // Need to remove tour from URL
    setContactFocus(undefined, true);
  };

  return (
    <AppealsContext.Provider
      value={{
        accountListId: accountListId ?? '',
        contactId: contactId,
        contactsQueryResult: contactsQueryResult,
        selectionType: selectionType,
        isRowChecked: isRowChecked,
        toggleSelectAll: toggleSelectAll,
        toggleSelectionById: toggleSelectionById,
        selectMultipleIds: selectMultipleIds,
        deselectMultipleIds: deselectMultipleIds,
        filterData: filterData,
        filtersLoading: filtersLoading,
        toggleFilterPanel: toggleFilterPanel,
        handleClearAll: handleClearAll,
        savedFilters: savedFilters,
        setContactFocus: setContactFocus,
        getContactUrl: getContactUrl,
        handleViewModeChange: handleViewModeChange,
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
        appealId,
        page,
        tour,
        nextTourStep,
        hideTour,
        askedCountQueryResult,
        excludedCountQueryResult,
        committedCountQueryResult,
        givenCountQueryResult,
        receivedCountQueryResult,
      }}
    >
      {children}
    </AppealsContext.Provider>
  );
};
