import React from 'react';
import { DynamicFilterPanel } from 'src/components/Shared/Filters/DynamicFilterPanel';
import { useIsOnline } from 'src/hooks/useIsOnline';
import { TableViewModeEnum } from '../../Shared/Header/ListHeader';
import {
  ContactsContext,
  ContactsType,
} from '../ContactsContext/ContactsContext';
import { DynamicContactsMapPanel } from '../ContactsMap/DynamicContactsMapPanel';
import { preDefinedFilters } from './preDefinedFilters';

export const ContactsLeftPanel: React.FC = () => {
  const {
    filterData,
    filtersLoading,
    savedFilters,
    toggleFilterPanel,
    mapData,
    panTo,
    selected,
    setSelected,
    viewMode,
    offlineMode,
  } = React.useContext(ContactsContext) as ContactsType;
  const isOnline = useIsOnline();

  return viewMode === TableViewModeEnum.Map ? (
    <DynamicContactsMapPanel
      data={mapData}
      panTo={panTo}
      selected={selected}
      setSelected={setSelected}
      onClose={toggleFilterPanel}
    />
  ) : filterData && !filtersLoading ? (
    <DynamicFilterPanel
      filters={filterData?.accountList?.contactFilterGroups}
      preDefinedFilters={preDefinedFilters}
      savedFilters={savedFilters}
      onClose={toggleFilterPanel}
      disabled={!isOnline}
      clearAllDisabled={offlineMode}
    />
  ) : null;
};
