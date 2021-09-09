import React, { useState } from 'react';
import { Box, colors, CircularProgress, Typography } from '@material-ui/core';
import { Virtuoso } from 'react-virtuoso';
import { ContactRow } from '../ContactRow/ContactRow';
import {
  ContactsHeader,
  ContactCheckBoxState,
} from '../ContactsHeader/ContactsHeader';
import { useContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { ContactFilterSetInput } from '../../../../graphql/types.generated';

interface Props {
  accountListId: string;
  onContactSelected: (contactId: string) => void;
  onSearchTermChange: (searchTerm?: string) => void;
  activeFilters: ContactFilterSetInput;
  filterPanelOpen: boolean;
  toggleFilterPanel: () => void;
}

export const ContactsTable: React.FC<Props> = ({
  accountListId,
  onContactSelected,
  onSearchTermChange,
  activeFilters,
  filterPanelOpen,
  toggleFilterPanel,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState<string>();
  const [selectedContacts, setSelectedContacts] = useState<Array<string>>([]);

  const { data, loading, error, fetchMore } = useContactsQuery({
    variables: {
      accountListId,
      contactsFilters: { ...activeFilters, wildcardSearch: searchTerm },
    },
  });

  const renderLoading = () => (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Box padding={2}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
      <CircularProgress size={24} />
    </Box>
  );

  const renderEmpty = () => (
    <Box height="100%" bgcolor={colors.yellow[600]}>
      No Data
    </Box>
  );

  const renderError = () => (
    <Box bgcolor={colors.red[600]}>Error: {error?.toString()}</Box>
  );

  const handleOnContactSelected = (id: string) => {
    onContactSelected(id);
  };

  const handleSetSearchTerm = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    onSearchTermChange(searchTerm);
  };

  const handleCheckOneContact = (
    event: React.ChangeEvent<HTMLInputElement>,
    contactId: string,
  ): void => {
    if (!selectedContacts.includes(contactId)) {
      setSelectedContacts((prevSelected) => [...prevSelected, contactId]);
    } else {
      setSelectedContacts((prevSelected) =>
        prevSelected.filter((id) => id !== contactId),
      );
    }
  };

  const handleCheckAllContacts = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setSelectedContacts(
      event.target.checked
        ? data?.contacts.nodes.map((contact) => contact.id) ?? []
        : [],
    );
  };

  const isSelectedSomeContacts =
    selectedContacts.length > 0 &&
    selectedContacts.length < (data?.contacts.nodes.length ?? 0);
  const isSelectedAllContacts =
    selectedContacts.length === data?.contacts.nodes.length;

  return (
    <>
      <ContactsHeader
        activeFilters={Object.keys(activeFilters).length > 0}
        filterPanelOpen={filterPanelOpen}
        toggleFilterPanel={toggleFilterPanel}
        onCheckAllContacts={handleCheckAllContacts}
        onSearchTermChanged={handleSetSearchTerm}
        totalContacts={data?.contacts.nodes.length}
        contactCheckboxState={
          isSelectedSomeContacts
            ? ContactCheckBoxState.partial
            : isSelectedAllContacts
            ? ContactCheckBoxState.checked
            : ContactCheckBoxState.unchecked
        }
      />
      {error && renderError()}
      {loading ? (
        renderLoading()
      ) : !(data && data.contacts.nodes.length > 0) ? (
        renderEmpty()
      ) : (
        <div data-testid="ContactRows">
          <Virtuoso
            data={data.contacts.nodes}
            style={{ height: 'calc(100vh - 160px)' }}
            endReached={() =>
              data.contacts.pageInfo.hasNextPage &&
              fetchMore({
                variables: { after: data.contacts.pageInfo.endCursor },
                updateQuery: (prev, { fetchMoreResult }) => {
                  if (!fetchMoreResult) {
                    return prev;
                  }
                  return {
                    ...prev,
                    ...fetchMoreResult,
                    contacts: {
                      ...prev.contacts,
                      ...fetchMoreResult.contacts,
                      nodes: [
                        ...prev.contacts.nodes,
                        ...fetchMoreResult.contacts.nodes,
                      ],
                    },
                  };
                },
              })
            }
            itemContent={(index, contact) => (
              <ContactRow
                accountListId={accountListId}
                key={index}
                contact={contact}
                isChecked={selectedContacts.includes(contact.id)}
                onContactSelected={handleOnContactSelected}
                onContactCheckToggle={handleCheckOneContact}
              />
            )}
            components={{
              Footer: () =>
                data.contacts.pageInfo.hasNextPage ? renderLoading() : null,
            }}
          />
        </div>
      )}
    </>
  );
};
