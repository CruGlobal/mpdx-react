import { Table } from '@material-ui/core';
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
  style,
  contacts = [],
  loading,
  error,
}: Props) => {
  return (
    <div style={style}>
      {error && <p>Error: {error.toString()}</p>}
      {loading ? (
        <p>Loading</p>
      ) : contacts.length === 0 ? (
        <p>No data</p>
      ) : (
        <Table>
          {contacts.map((contact) => (
            <ContactRow key={contact.id} contact={contact} />
          ))}
        </Table>
      )}
    </div>
  );
};

export default ContactsTable;
