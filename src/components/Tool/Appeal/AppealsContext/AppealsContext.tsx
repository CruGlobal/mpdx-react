import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce, omit } from 'lodash';
import { useContactFiltersQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { PageEnum } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { useUpdateUserOptionsMutation } from 'src/components/Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import { useGetUserOptionsQuery } from 'src/components/Contacts/ContactFlow/GetUserOptions.generated';
import {
  ContactsContextSavedFilters as AppealsContextSavedFilters,
  ContactsContextProps,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { UserOptionFragment } from 'src/components/Shared/Filters/FilterPanel.generated';
import { useGetIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useMassSelection } from 'src/hooks/useMassSelection';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';
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
  > {
  selectMultipleIds: (ids: string[]) => void;
  deselectMultipleIds: (ids: string[]) => void;
  setViewMode: (mode: TableViewModeEnum) => void;
  setContactFocus: (id: string | undefined) => void;
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
  extends Omit<ContactsContextProps, 'contactId'> {
  contactId: string | string[] | undefined;
  appealId: string | undefined;
  page?: PageEnum;
}

export const AppealsProvider: React.FC<AppealsContextProps> = ({
  children,
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
  const { query, push, replace, pathname } = router;

  const [contactDetailsId, setContactDetailsId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<TableViewModeEnum>(
    TableViewModeEnum.Flows,
  );
  const [tour, setTour] = useState<AppealTourEnum | null>(null);

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
      ...sanitizedFilters,
      ...starredFilter,
      wildcardSearch: searchTerm as string,
      ids: [],
      appeal: [appealId || ''],
    }),
    [sanitizedFilters, starredFilter, searchTerm, appealId],
  );

  const contactsQueryResult = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters,
      first: 25,
    },
    skip: !accountListId,
  });
  const { data } = contactsQueryResult;

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
  // In the flows view, we need the total count of all contacts in every column, but the API
  // filters out contacts excluded from an appeal. We have to load excluded contacts also and
  // manually merge them with the other contacts.
  const { data: allExcludedContacts } = useGetIdsForMassSelectionQuery({
    variables: {
      accountListId,
      first: contactCount,
      contactsFilters: { ...contactsFilters, appealStatus: 'excluded' },
    },
    // Skip this query when there is an appealStatus filter from the list view
    skip: contactCount === 0 || !!contactsFilters.appealStatus,
  });
  const allContactIds = useMemo(
    () =>
      [
        ...(allContacts?.contacts.nodes ?? []),
        ...(allExcludedContacts?.contacts.nodes ?? []),
      ].map((contact) => contact.id),
    [allContacts, allExcludedContacts],
  );

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
  const setContactFocus = (id: string | undefined, endTour = false) => {
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

  const [updateUserOptions] = useUpdateUserOptionsMutation();

  const updateOptions = async (view: string): Promise<void> => {
    await updateUserOptions({
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
        searchTerm: searchTerm,
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
        setSearchTerm: setSearchTerm,
        handleViewModeChange: handleViewModeChange,
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
