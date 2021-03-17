import React, { ReactElement } from 'react';
import { QueryLazyOptions } from '@apollo/client';
import { Box, colors } from '@material-ui/core';
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
    <Box display="flex" border={1} borderColor={colors.red[600]}>
      <Box flex={1}>
        <ContactFilters
          style={{ flex: 1 }}
          data={filtersData}
          loading={filtersLoading}
          error={filtersError}
          loadFilters={loadContactFilters}
        />
      </Box>
      <Box flex={4} flexDirection={'column'}>
        <ContactsHeader style={{ height: 200 }} />
        <ContactsTable
          style={{}}
          contacts={contactsData?.contacts.nodes}
          loading={contactsLoading}
          error={contactsError}
        />{' '}
      </Box>
    </Box>
  );
};

export default Contacts;
