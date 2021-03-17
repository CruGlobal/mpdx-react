import { Box, colors, Table } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import React from 'react';
import ContactRow from '../ContactRow/ContactRow';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';

interface Props {
  contacts: ContactRowFragment[] | undefined;
  loading: boolean;
  error: Error;
  style: CSSProperties;
}

const ContactsTable: React.FC<Props> = ({
  contacts = [],
  loading,
  error,
}: Props) => {
  const renderLoading = () => (
    <Box flex={1} height={'100%'} bgcolor={colors.green[600]}>
      <p>Loading</p>
    </Box>
  );

  const renderEmpty = () => (
    <div style={{ backgroundColor: colors.yellow[600] }}>No Data</div>
  );

  const renderError = () => (
    <div style={{ backgroundColor: colors.red[600] }}>
      Error: {error.toString()}
    </div>
  );

  return (
    <Box flex={1}>
      {error && renderError()}
      {!loading ? (
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
