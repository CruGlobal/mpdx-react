import React, { ReactElement } from 'react';
import { ContactRowFragment } from './ContactRow.generated';

interface Props {
  contact: ContactRowFragment;
}

export const ContactRow: React.FC<Props> = ({ contact }) => {
  return <div>{contact.name}</div>;
};
