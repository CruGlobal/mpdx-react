import React from 'react';
import _ from 'lodash';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import {
  ContactsContext,
  ContactsType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsContext';
import { ContactsMap } from '../../../../pages/accountLists/[accountListId]/contacts/map/map';
import { ContactFlow } from '../ContactFlow/ContactFlow';
import { ContactsList } from '../ContactsList/ContactsList';
import { ContactsMainPanelHeader } from './ContactsMainPanelHeader';

export const ContactsMainPanel: React.FC = () => {
  const {
    accountListId,
    activeFilters,
    starredFilter,
    searchTerm,
    getContactUrl,
    viewMode,
    userOptionsLoading,
  } = React.useContext(ContactsContext) as ContactsType;

  return (
    <>
      <ContactsMainPanelHeader />
      {!userOptionsLoading &&
        (viewMode === TableViewModeEnum.List ? (
          <ContactsList />
        ) : viewMode === TableViewModeEnum.Flows ? (
          <ContactFlow
            accountListId={accountListId ?? ''}
            selectedFilters={{
              ...activeFilters,
              ...starredFilter,
            }}
            searchTerm={searchTerm}
            getContactUrl={getContactUrl}
          />
        ) : (
          <ContactsMap />
        ))}
    </>
  );
};
