import { Table } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import React from 'react';
import ContactRow from '../ContactRow/ContactRow';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';

interface Props {
  contacts: ContactRowFragment[];
  style: CSSProperties;
}

const ContactsTable: React.FC<Props> = ({ contacts, style }) => {
  return (
    <div>
      {error && <p>Error: {error.toString()}</p>}
      {loading ? (
        <p>Loading</p>
      ) : !data?.contacts?.nodes ? (
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
