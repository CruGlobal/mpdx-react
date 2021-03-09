import React from 'react';
import { ContactRowFragment } from './ContactRow.generated';

interface Props {
  contact: ContactRowFragment;
}

export const ContactRow: React.FC<Props> = ({ contact }) => {
  return <div role="row">{contact.name}</div>;
};
