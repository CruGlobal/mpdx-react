import React from 'react';
import { ContactsContainer } from 'src/components/Contacts/ContactsContainer';
import { ContactsPage } from './ContactsPage';

const Contacts: React.FC = () => {
  return (
    <ContactsPage>
      <ContactsContainer />
    </ContactsPage>
  );
};

export default Contacts;
