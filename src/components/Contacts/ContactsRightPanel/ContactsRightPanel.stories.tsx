import React from 'react';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { ContactDetailProvider } from '../ContactDetails/ContactDetailContext';
import { ContactsRightPanel } from './ContactsRightPanel';

export default {
  title: 'Contacts/RightPanel',
};

export const Default = (): React.ReactElement => {
  return (
    <ContactsWrapper>
      <ContactDetailProvider>
        <ContactsRightPanel onClose={() => {}} />
      </ContactDetailProvider>
    </ContactsWrapper>
  );
};
