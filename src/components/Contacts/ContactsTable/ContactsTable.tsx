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
    <Table style={style}>
      {contacts.map((contact, index) => (
        <ContactRow key={index} contact={contact} />
      ))}
    </Table>
  );
};

export default ContactsTable;
