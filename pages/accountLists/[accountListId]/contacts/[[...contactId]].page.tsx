import React from 'react';
import _ from 'lodash';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { ContactsContainer } from 'src/components/Contacts/ContactsContainer';
import { ContactsPage } from './ContactsPage';

const Contacts: React.FC = () => {
  return (
    <ContactsPage>
      <ContactsContainer />
    </ContactsPage>
  );
};

export const getServerSideProps = loadSession;

export default Contacts;
