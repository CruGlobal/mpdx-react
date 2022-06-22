import React from 'react';
import { ContactsRightPanel } from './ContactsRightPanel';
import { ContactsPageProvider } from 'pages/accountLists/[accountListId]/contacts/ContactsPageContext';

export default {
  title: 'Contacts/RightPanel',
};

export const Default = (): React.ReactElement => {
  return (
    <ContactsPageProvider>
      <ContactsRightPanel />
    </ContactsPageProvider>
  );
};
