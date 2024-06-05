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
import { ContactRow } from '../ContactRow/ContactRow';
import { ContactRowSkeleton } from '../ContactRow/ContactRowSkeleton.skeleton';

export const ContactsList: React.FC = () => {
  const {
    contactsQueryResult: { data, loading, fetchMore },
    searchTerm,
    isFiltered,
    setActiveFilters,
    userOptionsLoading,
  } = React.useContext(ContactsContext) as ContactsType;

  return (
    <InfiniteList
      loading={loading || userOptionsLoading}
      Skeleton={ContactRowSkeleton}
      numberOfSkeletons={25}
      data={data?.contacts?.nodes ?? []}
      style={{ height: `calc(100vh - ${navBarHeight} - ${headerHeight})` }}
      itemContent={
        loading
          ? (index) => <ContactRowSkeleton key={index} />
          : (index, contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                useTopMargin={index === 0}
              />
            )
      }
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
            filtered={isFiltered || !!searchTerm}
            changeFilters={setActiveFilters}
          />
        </Box>
      }
    />
  );
};
