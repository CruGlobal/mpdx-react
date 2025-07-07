import React, { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { useContactFiltersQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { useGetUserOptionsQuery } from 'src/components/Contacts/ContactFlow/GetUserOptions.generated';
import {
  ContactsContextSavedFilters as AppealsContextSavedFilters,
  ContactsContextProps,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { UserOptionFragment } from 'src/components/Shared/Filters/FilterPanel.generated';
import { useContactPanel } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
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

export interface AppealsType
  extends Omit<
    ContactsType,
    | 'selected'
    | 'setSelected'
    | 'mapRef'
    | 'panTo'
    | 'mapData'
    | 'contactsQueryResult'
    | 'viewMode'
    | 'setViewMode'
    | 'getContactHrefObject'
  > {
  selectMultipleIds: (ids: string[]) => void;
  deselectMultipleIds: (ids: string[]) => void;
  viewMode: TableViewModeEnum;
  setViewMode: Dispatch<SetStateAction<TableViewModeEnum>>;
  contactsQueryResult: ReturnType<typeof useContactsQuery>;
  appealId: string | undefined;
  listAppealStatus: AppealStatusEnum;
  setListAppealStatus: Dispatch<SetStateAction<AppealStatusEnum>>;
  tour: AppealTourEnum | null;
  setTour: Dispatch<SetStateAction<AppealTourEnum | null>>;
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
  extends Omit<ContactsContextProps, 'viewMode' | 'setViewMode'> {
  appealId: string | undefined;
  viewMode: TableViewModeEnum;
  setViewMode: Dispatch<SetStateAction<TableViewModeEnum>>;
  tour: AppealTourEnum | null;
  setTour: Dispatch<SetStateAction<AppealTourEnum | null>>;
}

export const AppealsProvider: React.FC<AppealsContextProps> = ({
  children,
  filterPanelOpen,
  setFilterPanelOpen,
  appealId,
  viewMode,
  setViewMode,
  tour,
  setTour,
}) => {
  const accountListId = useAccountListId() ?? '';

  const [listAppealStatus, setListAppealStatus] = useState<AppealStatusEnum>(
    AppealStatusEnum.Asked,
  );

  const {
    openContactId: contactDetailsId,
    openContact,
    closePanel,
  } = useContactPanel();
  const { activeFilters, searchTerm, setSearchTerm, combinedFilters } =
    useUrlFilters();

  //User options for display view
  const { loading: userOptionsLoading } = useGetUserOptionsQuery({
    onCompleted: ({ userOptions }) => {
      const defaultView =
        userOptions.find((option) => option.key === 'contacts_view')?.value ===
        TableViewModeEnum.List
          ? TableViewModeEnum.List
          : TableViewModeEnum.Flows;
      if (
        contactId?.includes('list') ||
        defaultView === TableViewModeEnum.List
      ) {
        setViewMode(TableViewModeEnum.List);
        setFilterPanelOpen(true);
        setListAppealStatus(AppealStatusEnum.Asked);
      } else {
        setViewMode(defaultView);
      }
    },
  });

  const contactsFilters = useMemo(
    () => ({
      // In list mode, always filter by the selected appeal status
      // In flows mode, filter by the filters the user selected
      ...(viewMode === TableViewModeEnum.List
        ? { appealStatus: listAppealStatus }
        : combinedFilters),
      appeal: [appealId || ''],
    }),
    [viewMode, listAppealStatus, combinedFilters, appealId],
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

  const { openContactId: contactId } = useContactPanel();

  const { data: filterData, loading: filtersLoading } = useContactFiltersQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
    context: {
      doNotBatch: true,
    },
  });

  const defaultFilters = {
    appeal: [appealId || ''],
    ...(searchTerm ? { wildcardSearch: searchTerm } : {}),
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
  //#endregion

  //#region User Actions
  const setContactFocus = (id: string | undefined) => {
    if (typeof id === 'string') {
      openContact(id);
    } else {
      closePanel();
    }
  };

  const handleViewModeChange = (_, view: string) => {
    setViewMode(view as TableViewModeEnum);
    updateOptions(view);
    if (view === TableViewModeEnum.List) {
      setFilterPanelOpen(true);
      setListAppealStatus(AppealStatusEnum.Asked);
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
        setListAppealStatus(AppealStatusEnum.Excluded);
        break;
      case AppealTourEnum.ReviewExcluded:
        setTour(AppealTourEnum.ReviewAsked);
        setListAppealStatus(AppealStatusEnum.Asked);
        break;
      case AppealTourEnum.ReviewAsked:
        setFilterPanelOpen(true);
        setTour(AppealTourEnum.ExportContacts);
        setListAppealStatus(AppealStatusEnum.Asked);
        deselectAll();
        toggleSelectAll();
        break;
      case AppealTourEnum.ExportContacts:
        setTour(AppealTourEnum.Finish);
        setListAppealStatus(AppealStatusEnum.Asked);
        break;
      default:
        setTour(null);
        break;
    }
  };
  const hideTour = () => {
    setTour(null);
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
        handleViewModeChange: handleViewModeChange,
        filterPanelOpen: filterPanelOpen,
        setFilterPanelOpen: setFilterPanelOpen,
        contactDetailsOpen: typeof contactDetailsId === 'string',
        contactDetailsId: contactDetailsId,
        viewMode: viewMode,
        setViewMode: setViewMode,
        selectedIds: ids,
        deselectAll: deselectAll,
        userOptionsLoading: userOptionsLoading,
        appealId,
        tour,
        setTour,
        listAppealStatus,
        setListAppealStatus,
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
