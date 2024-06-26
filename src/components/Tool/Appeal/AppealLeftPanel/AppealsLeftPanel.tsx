import React from 'react';
import { testAppeal2 } from 'pages/accountLists/[accountListId]/tools/appeals/testAppeal';
import { DynamicFilterPanel } from 'src/components/Shared/Filters/DynamicFilterPanel';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import AppealDrawer from '../AppealDrawer/AppealDrawer';
import { AppealsContext, AppealsType } from '../ContactsContext/AppealsContext';

export const AppealsLeftPanel: React.FC = () => {
  const {
    filterData,
    filtersLoading,
    savedFilters,
    activeFilters,
    toggleFilterPanel,
    setActiveFilters,
    viewMode,
  } = React.useContext(AppealsContext) as AppealsType;

  return viewMode !== TableViewModeEnum.Flows ? (
    <AppealDrawer open={true} toggle={toggleFilterPanel} appeal={testAppeal2} />
  ) : filterData && !filtersLoading ? (
    <DynamicFilterPanel
      filters={filterData?.accountList?.contactFilterGroups}
      savedFilters={savedFilters}
      selectedFilters={activeFilters}
      onClose={toggleFilterPanel}
      onSelectedFiltersChanged={setActiveFilters}
    />
  ) : null;
};
