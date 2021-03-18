import React from 'react';
import { Box, Table, colors } from '@material-ui/core';
import { ContactRow } from '../ContactRow';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';

interface Props {
  contacts: ContactRowFragment[] | undefined;
  loading: boolean;
  error: Error;
}

const ContactsTable: React.FC<Props> = ({
  contacts = [],
  loading,
  error,
}: Props) => {
  const renderLoading = () => (
    <Box
      height="100%"
      alignItems="center"
      justifyContent="center"
      bgcolor={colors.green[600]}
    >
      Loading
    </Box>
  );

  const renderEmpty = () => (
    <Box height="100%" bgcolor={colors.yellow[600]}>
      No Data
    </Box>
  );

  const renderError = () => (
    <Box bgcolor={colors.red[600]}>Error: {error.toString()}</Box>
  );

  return (
    <Box height="100%">
      {error && renderError()}
      {loading ? (
        renderLoading()
      ) : contacts.length === 0 ? (
        renderEmpty()
      ) : (
        <Table>
          {contacts.map((contact) => (
            <ContactRow key={contact.id} contact={contact} />
          ))}
        </Table>
      )}
    </Box>
  );
};

export default ContactsTable;
