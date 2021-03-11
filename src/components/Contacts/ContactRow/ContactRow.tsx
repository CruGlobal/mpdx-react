import { TableRow } from '@material-ui/core';
import React from 'react';
import { ContactRowFragment } from './ContactRow.generated';

interface Props {
  contact: ContactRowFragment;
}

const ContactRow: React.FC<Props> = ({ contact }) => {
  return <TableRow>{contact.name}</TableRow>;
};

export default ContactRow;
