import { Box } from '@material-ui/core';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { ContactRow } from '../ContactRow/ContactRow';
import { ContactFilterSetInput } from '../../../../graphql/types.generated';
import { useContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import NullState from 'src/components/Shared/Filters/NullState/NullState';
import {
  ContactsPageContext,
  ContactsPageProvider,
  ContactsPageType,
} from 'pages/accountLists/[accountListId]/contacts/ContactsPageContext';

interface ContactsListProps {
  accountListId: string;
  starredFilter: ContactFilterSetInput;
  toggleSelectionById: (contactId: string) => void;
  isRowChecked: (id: string) => boolean;
  setContactFocus: () => void;
}

export const ContactsList: React.FC<ContactsListProps> = ({
  accountListId,
  starredFilter,
  toggleSelectionById,
  isRowChecked,
  setContactFocus,
}: ContactsListProps) => {
  const { query } = useRouter();

  const { contactDetailsOpen } = React.useContext(
    ContactsPageContext,
  ) as ContactsPageType;
  //#region Filters
  const { contactId, searchTerm, filters } = query;

  const urlFilters = filters && JSON.parse(decodeURI(filters as string));

  const [_activeFilters, setActiveFilters] = useState<ContactFilterSetInput>(
    urlFilters ?? {},
  );

  const isFiltered =
    Object.keys(urlFilters ?? {}).length > 0 ||
    Object.values(urlFilters ?? {}).some((filter) => filter !== []);

  //#endregion Filters

  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: {
        ...urlFilters,
        wildcardSearch: searchTerm as string,
        ...starredFilter,
      },
      first: contactId?.includes('map') ? 20000 : 25,
    },
    skip: !accountListId,
  });

  return (
    <ContactsPageProvider>
      <InfiniteList
        loading={loading}
        data={data?.contacts?.nodes ?? []}
        totalCount={data?.contacts?.totalCount ?? 0}
        style={{ height: 'calc(100vh - 160px)' }}
        itemContent={(index, contact) => (
          <ContactRow
            accountListId={accountListId}
            key={index}
            contact={contact}
            isChecked={isRowChecked(contact.id)}
            onContactSelected={setContactFocus}
            onContactCheckToggle={toggleSelectionById}
            contactDetailsOpen={contactDetailsOpen}
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
    </ContactsPageProvider>
  );
};
