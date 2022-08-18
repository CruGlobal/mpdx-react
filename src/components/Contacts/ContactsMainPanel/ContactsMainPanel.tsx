import React from 'react';
import _ from 'lodash';
import { ContactFlow } from '../ContactFlow/ContactFlow';
import { ContactsList } from '../ContactsList/ContactsList';
import { ContactsMap } from '../../../../pages/accountLists/[accountListId]/contacts/map/map';
import {
  ContactsPageContext,
  ContactsPageType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { ContactsMainPanelHeader } from './ContactsMainPanelHeader';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';

export const ContactsMainPanel: React.FC = () => {
  const {
    accountListId,
    activeFilters,
    starredFilter,
    searchTerm,
    setContactFocus,
    viewMode,
  } = React.useContext(ContactsPageContext) as ContactsPageType;

  return (
    <>
      <ContactsMainPanelHeader />
      {viewMode === TableViewModeEnum.List ? (
        <>
          <ContactsList />
        </>
      ) : viewMode === TableViewModeEnum.Flows ? (
        <ContactFlow
          accountListId={accountListId ?? ''}
          selectedFilters={{
            ...activeFilters,
            ...starredFilter,
          }}
          searchTerm={searchTerm}
          onContactSelected={setContactFocus}
        />
      ) : (
        <ContactsMap />
      )}
    </>
  );
};
