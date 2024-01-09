import React from 'react';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';
import { ContactDetailProvider } from '../ContactDetails/ContactDetailContext';
import { ContactsRightPanel } from './ContactsRightPanel';

export default {
  title: 'Contacts/RightPanel',
};

export const Default = (): React.ReactElement => {
  return (
    <ContactsPage>
      <ContactDetailProvider>
        <ContactsRightPanel onClose={() => {}} />
      </ContactDetailProvider>
    </ContactsPage>
  );
};
