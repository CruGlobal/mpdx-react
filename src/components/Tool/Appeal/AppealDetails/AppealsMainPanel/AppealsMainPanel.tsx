import React from 'react';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
// import { DynamicContactFlow } from '../ContactFlow/DynamicContactFlow';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { DynamicContactsList } from '../../List/ContactsList/DynamicContactsList';
import { AppealsMainPanelHeader } from './AppealsMainPanelHeader';

export const AppealsMainPanel: React.FC = () => {
  const {
    // accountListId,
    // activeFilters,
    // starredFilter,
    // searchTerm,
    // setContactFocus,
    viewMode,
    userOptionsLoading,
  } = React.useContext(AppealsContext) as AppealsType;

  return (
    <>
      <AppealsMainPanelHeader />
      {!userOptionsLoading &&
        (viewMode === TableViewModeEnum.List ? (
          <DynamicContactsList />
        ) : (
          <h3>Flows</h3>
          // <DynamicContactFlow
          //   accountListId={accountListId ?? ''}
          //   selectedFilters={{
          //     ...activeFilters,
          //     ...starredFilter,
          //   }}
          //   searchTerm={searchTerm}
          //   onContactSelected={setContactFocus}
          // />
        ))}
    </>
  );
};
