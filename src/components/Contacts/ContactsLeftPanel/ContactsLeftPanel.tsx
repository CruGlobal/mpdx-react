import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicFilterPanel } from 'src/components/Shared/Filters/DynamicFilterPanel';
import { FilterPanelSkeleton } from 'src/components/Shared/Filters/FilterPanel.skeleton';
import { TableViewModeEnum } from '../../Shared/Header/ListHeader';
import {
  ContactsContext,
  ContactsType,
} from '../ContactsContext/ContactsContext';
import { ContactsMapPanel } from '../ContactsMap/ContactsMapPanel';

export const ContactsLeftPanel: React.FC = () => {
  const { t } = useTranslation();
  const {
    filterData,
    filtersLoading,
    savedFilters,
    activeFilters,
    toggleFilterPanel,
    setActiveFilters,
    mapData,
    panTo,
    selected,
    setSelected,
    viewMode,
  } = React.useContext(ContactsContext) as ContactsType;

  const loadingMapFilterGroups = useMemo(
    () => [
      t('Appointment Scheduled'),
      t('Ask In Future'),
      t('All Inactive'),
      t('No Primary Address Set'),
    ],
    [],
  );

  return viewMode === TableViewModeEnum.Map ? (
    mapData ? (
      <ContactsMapPanel
        data={mapData}
        panTo={panTo}
        selected={selected}
        setSelected={setSelected}
        onClose={toggleFilterPanel}
      />
    ) : (
      <FilterPanelSkeleton
        defaultStyle={false}
        filterTitle={t('Partners by Status')}
        filterGroups={loadingMapFilterGroups}
        onClose={toggleFilterPanel}
      />
    )
  ) : filterData && !filtersLoading ? (
    <DynamicFilterPanel
      filters={filterData?.accountList?.contactFilterGroups}
      savedFilters={savedFilters}
      selectedFilters={activeFilters}
      onClose={toggleFilterPanel}
      onSelectedFiltersChanged={setActiveFilters}
    />
  ) : (
    <FilterPanelSkeleton onClose={toggleFilterPanel} />
  );
};
