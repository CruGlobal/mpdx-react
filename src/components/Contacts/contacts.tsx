import React, { ReactElement } from 'react';
import { ContactsQuery } from '../../../pages/accountLists/[accountListId]/Contacts.generated';
import ContactFilters from './ContactFilters/ContactFilters';
import ContactsHeader from './ContactsHeader/ContactsHeader';
import ContactsTable from './ContactsTable/ContactsTable';

interface Props {
  data: ContactsQuery;
}

const Contacts = ({ data }: Props): ReactElement => {
  return (
    <div style={{ flex: 1, flexDirection: 'row' }}>
      <ContactFilters style={{ flex: 1 }} />
      <div style={{ flex: 8, flexDirection: 'column' }}>
        <ContactsHeader style={{ height: 80 }} />
        <ContactsTable contacts={data.contacts.nodes} style={{ flex: 1 }} />
      </div>
    </div>
  );
};

export default Contacts;
