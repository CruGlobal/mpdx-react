import React from 'react';
import { ContactDetails } from '../ContactDetails/ContactDetails';
import {
  ContactsPageContext,
  ContactsPageType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { TableViewModeEnum } from '../../../../src/components/Shared/Header/ListHeader';

export const ContactsRightPanel: React.FC = () => {
  const {
    contactDetailsId,
    contactId,
    accountListId,
    setContactFocus,
    viewMode,
  } = React.useContext(ContactsPageContext) as ContactsPageType;

  return (
    <>
      {contactDetailsId && contactId && accountListId ? (
        <ContactDetails
          accountListId={accountListId}
          contactId={contactDetailsId}
          onContactSelected={setContactFocus}
          onClose={() =>
            setContactFocus(
              undefined,
              true,
              viewMode === TableViewModeEnum.Flows,
              viewMode === TableViewModeEnum.Map,
            )
          }
        />
      ) : (
        <></>
      )}
    </>
  );
};
