import React from 'react';
import { Box, Table, colors } from '@material-ui/core';
import { ContactRow } from '../ContactRow';
import ContactsHeader from '../ContactsHeader/ContactsHeader';
import { useContactsQuery } from '../../../../pages/accountLists/[accountListId]/Contacts.generated';

interface Props {
  accountListId: string;
}

const ContactsTable: React.FC<Props> = ({ accountListId }: Props) => {
  const { data, loading, error } = useContactsQuery({
    variables: { accountListId: accountListId as string },
  });

  const renderLoading = () => (
    <Box
      data-testID="LoadingText"
      height="100%"
      alignItems="center"
      justifyContent="center"
      bgcolor={colors.green[600]}
    >
      Loading
    </Box>
  );

  const renderEmpty = () => (
    <Box data-testID="EmptyText" height="100%" bgcolor={colors.yellow[600]}>
      No Data
    </Box>
  );

  const renderError = () => (
    <Box data-testID="ErrorText" bgcolor={colors.red[600]}>
      Error: {error.toString()}
    </Box>
  );

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <ContactsHeader />
      {error && renderError()}
      {loading ? (
        renderLoading()
      ) : data.contacts.nodes?.length === 0 ? (
        renderEmpty()
      ) : (
        <Table data-testID="ContactsTable">
          {data.contacts.nodes?.map((contact) => (
            <ContactRow key={contact.id} contact={contact} />
          ))}
        </Table>
      )}
    </Box>
  );
};

export default ContactsTable;
