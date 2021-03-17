import React, { ReactElement } from 'react';
import { QueryLazyOptions } from '@apollo/client';
import { Exact } from '../../../graphql/types.generated';
import { ContactsQuery } from '../../../pages/accountLists/[accountListId]/Contacts.generated';
import { ContactFiltersQuery } from '../../../pages/accountLists/[accountListId]/ContactFilters.generated';
import ContactFilters from './ContactFilters/ContactFilters';
import ContactsHeader from './ContactsHeader/ContactsHeader';
import ContactsTable from './ContactsTable/ContactsTable';

interface Props {
  contactsData: ContactsQuery;
  contactsLoading: boolean;
  contactsError: Error;
  filtersData: ContactFiltersQuery;
  filtersLoading: boolean;
  filtersError: Error;
  loadContactFilters: (
    options: QueryLazyOptions<Exact<{ accountListId: string }>>,
  ) => void;
}

const Contacts = ({
  contactsData,
  contactsLoading,
  contactsError,
  filtersData,
  filtersLoading,
  filtersError,
  loadContactFilters,
}: Props): ReactElement => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <ContactFilters
        style={{ flex: 1 }}
        data={filtersData}
        loading={filtersLoading}
        error={filtersError}
        loadFilters={loadContactFilters}
      />
      <div style={{ flex: 8, flexDirection: 'column' }}>
        <ContactsHeader style={{ height: 200 }} />
        <ContactsTable
          style={{ flex: 1 }}
          contacts={contactsData?.contacts.nodes}
          loading={contactsLoading}
          error={contactsError}
        />{' '}
      </div>
    </div>
  );
};

export default Contacts;
