import React from 'react';
import { Box } from '@mui/material';
import {
  ContactsContext,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import NullState from 'src/components/Shared/Filters/NullState/NullState';
import {
  TableViewModeEnum,
  headerHeight,
} from 'src/components/Shared/Header/ListHeader';
import { useContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { ContactRow } from '../ContactRow/ContactRow';
import { ContactRowSkeleton } from '../ContactRow/ContactRowSkeleton';

export const ContactsList: React.FC = () => {
  const {
    contactId,
    accountListId,
    sanitizedFilters,
    searchTerm,
    starredFilter,
    viewMode,
    urlFilters,
    isFiltered,
    setActiveFilters,
    userOptionsLoading,
  } = React.useContext(ContactsContext) as ContactsType;

  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: {
        ...sanitizedFilters,
        wildcardSearch: searchTerm as string,
        ...starredFilter,
        ids:
          viewMode === TableViewModeEnum.Map && urlFilters
            ? urlFilters.ids
            : [],
      },
      first: contactId?.includes('map') ? 20000 : 25,
    },
    skip: !accountListId || userOptionsLoading,
  });

  return (
    <>
      {userOptionsLoading && (
        <Box style={{ display: 'flex', flexWrap: 'wrap' }}>
          {[...Array(10).keys()].map((value) => (
            <ContactRowSkeleton key={value} />
          ))}
        </Box>
      )}
      {!userOptionsLoading && (
        <InfiniteList
          loading={loading || userOptionsLoading}
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
      )}
    </>
  );
};
