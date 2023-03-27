import { Box } from '@mui/material';
import React from 'react';
import { ContactRow } from '../ContactRow/ContactRow';
import { useContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import NullState from 'src/components/Shared/Filters/NullState/NullState';
import {
  ContactsContext,
  ContactsType,
} from 'pages/accountLists/[accountListId]/contacts/ContactsContext';
import {
  headerHeight,
  TableViewModeEnum,
} from 'src/components/Shared/Header/ListHeader';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';

export const ContactsList: React.FC = () => {
  const {
    contactId,
    accountListId,
    activeFilters,
    searchTerm,
    starredFilter,
    viewMode,
    urlFilters,
    isFiltered,
    setActiveFilters,
  } = React.useContext(ContactsContext) as ContactsType;

  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: {
        ...activeFilters,
        wildcardSearch: searchTerm as string,
        ...starredFilter,
        ids:
          viewMode === TableViewModeEnum.Map && urlFilters
            ? urlFilters.ids
            : [],
      },
      first: contactId?.includes('map') ? 20000 : 25,
    },
    skip: !accountListId,
  });

  return (
    <InfiniteList
      loading={loading}
      data={data?.contacts?.nodes ?? []}
      totalCount={data?.contacts?.totalCount ?? 0}
      style={{ height: `calc(100vh - ${navBarHeight} - ${headerHeight})` }}
      itemContent={(index, contact) => (
        <ContactRow
          key={contact.id}
          contact={contact}
          useTopMargin={index === 0}
        />
      )}
      groupBy={(item) => item.name[0].toUpperCase()}
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
            filtered={isFiltered}
            changeFilters={setActiveFilters}
          />
        </Box>
      }
    />
  );
};
