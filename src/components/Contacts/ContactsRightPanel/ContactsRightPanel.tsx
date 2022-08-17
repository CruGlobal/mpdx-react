import React from 'react';
import { ContactDetails } from '../ContactDetails/ContactDetails';
import { ContactDetailProvider } from '../ContactDetails/ContactDetailContext';

interface Props {
  onClose: () => void;
}
export const ContactsRightPanel: React.FC<Props> = ({ onClose }) => {
  return (
    <ContactDetailProvider>
      <ContactDetails onClose={onClose} />
    </ContactDetailProvider>
  );
};
