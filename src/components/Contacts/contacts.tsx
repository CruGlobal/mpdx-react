import React, { ReactElement } from 'react';
import { ContactsQuery } from '../../../pages/accountLists/[accountListId]/Contacts.generated';
import ContactFilters from './ContactFilters/ContactFilters';
import ContactsHeader from './ContactsHeader/ContactsHeader';
import ContactsTable from './ContactsTable/ContactsTable';

interface Props {
  data: ContactsQuery;
  loading: boolean;
  error: Error;
}

const Contacts = ({ data, loading, error }: Props): ReactElement => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <ContactFilters style={{ flex: 1 }} />
      <div style={{ flex: 8, flexDirection: 'column' }}>
        <ContactsHeader style={{ height: 200 }} />
        <ContactsTable
          style={{ flex: 1 }}
          contacts={data?.contacts.nodes}
          loading={loading}
          error={error}
        />{' '}
      </div>
    </div>
  );
};

export default Contacts;
