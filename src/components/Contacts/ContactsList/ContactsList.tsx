import React from 'react';
import { Box } from '@mui/material';
import {
  ContactsContext,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import NullState from 'src/components/Shared/Filters/NullState/NullState';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import { useUrlFilters } from 'src/components/Shared/UrlFiltersProvider/UrlFiltersProvider';
import { ContactRow } from '../ContactRow/ContactRow';
import {
  AddressChangedFilterBar,
  addressChangedFilterBarHeight,
} from './AddressChangedFilterBar';

export const ContactsList: React.FC = () => {
  const {
    contactsQueryResult: { data, loading, fetchMore },
  } = React.useContext(ContactsContext) as ContactsType;
  const { activeFilters } = useUrlFilters();
  const addressChangedFiltered = !!activeFilters.addressChanged;

  return (
    <>
      {addressChangedFiltered && <AddressChangedFilterBar />}
      <InfiniteList
        loading={loading}
        data={data?.contacts?.nodes ?? []}
        style={{
          height: `calc(100vh - ${navBarHeight} - ${headerHeight}${
            addressChangedFiltered ? ` - ${addressChangedFilterBarHeight}` : ''
          })`,
        }}
        itemContent={(index, contact) => (
          <ContactRow
            key={contact.id}
            contact={contact}
            useTopMargin={index === 0}
            addressChange={
              addressChangedFiltered ? contact.latestAddressChange : undefined
            }
          />
        )}
        groupBy={(item) => ({ label: item.name[0].toUpperCase() })}
        endReached={() =>
          data?.contacts?.pageInfo.hasNextPage &&
          fetchMore({
            variables: {
              after: data.contacts?.pageInfo.endCursor,
            },
          })
        }
        EmptyPlaceholder={
          <Box width="75%" margin="auto" mt={2}>
            <NullState
              page="contact"
              totalCount={data?.allContacts.totalCount || 0}
            />
          </Box>
        }
      />
    </>
  );
};
