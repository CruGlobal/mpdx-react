import React from 'react';
import _ from 'lodash';
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
