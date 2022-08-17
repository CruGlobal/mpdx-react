import React from 'react';
import _ from 'lodash';
import { ContactsPageProvider } from './ContactsPageContext';
import { ContactsContainer } from 'src/components/Contacts/ContactsContainer';

const ContactsPage: React.FC = () => {
  return (
    <ContactsPageProvider>
      <ContactsContainer />
    </ContactsPageProvider>
  );
};

export default ContactsPage;
