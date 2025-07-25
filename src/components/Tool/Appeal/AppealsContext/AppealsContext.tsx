import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useContactFiltersQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  ContactsContextProps,
  ContactsType,
  parseSavedFilters,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { useUrlFilters } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { useGetIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
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

// The map view mode is not available in appeals
export type AppealsViewModeEnum =
  | TableViewModeEnum.List
  | TableViewModeEnum.Flows;
export { TableViewModeEnum };

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
    | 'userOptionsLoading'
  > {
  selectMultipleIds: (ids: string[]) => void;
  deselectMultipleIds: (ids: string[]) => void;
  viewMode: AppealsViewModeEnum | null;
  setViewMode: (viewMode: AppealsViewModeEnum) => void;
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
  viewMode: AppealsViewModeEnum | null;
  setViewMode: (viewMode: AppealsViewModeEnum) => void;
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

  const { searchTerm, combinedFilters } = useUrlFilters();

  //User options for display view
  useEffect(() => {
    if (viewMode === TableViewModeEnum.List) {
      setFilterPanelOpen(true);
      setListAppealStatus(AppealStatusEnum.Asked);
    }
  }, [viewMode]);

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

  const toggleFilterPanel = useCallback(() => {
    setFilterPanelOpen((filterPanelOpen) => !filterPanelOpen);
  }, []);

  const savedFilters = useMemo(
    () => parseSavedFilters(filterData, accountListId),
    [filterData, accountListId],
  );
  //#endregion

  //#region JSX

  const nextTourStep = useCallback(() => {
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
  }, [tour]);
  const hideTour = useCallback(() => {
    setTour(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      accountListId: accountListId ?? '',
      contactsQueryResult,
      selectionType,
      isRowChecked,
      toggleSelectAll,
      toggleSelectionById,
      selectMultipleIds,
      deselectMultipleIds,
      filterData,
      filtersLoading,
      toggleFilterPanel,
      savedFilters,
      filterPanelOpen,
      setFilterPanelOpen,
      viewMode,
      setViewMode,
      selectedIds: ids,
      deselectAll,
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
    }),
    [
      accountListId,
      contactsQueryResult,
      selectionType,
      isRowChecked,
      toggleSelectAll,
      toggleSelectionById,
      selectMultipleIds,
      deselectMultipleIds,
      filterData,
      filtersLoading,
      toggleFilterPanel,
      savedFilters,
      filterPanelOpen,
      setFilterPanelOpen,
      viewMode,
      setViewMode,
      ids,
      deselectAll,
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
    ],
  );

  return (
    <AppealsContext.Provider value={contextValue}>
      {children}
    </AppealsContext.Provider>
  );
};
