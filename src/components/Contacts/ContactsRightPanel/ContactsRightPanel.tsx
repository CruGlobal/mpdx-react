import React from 'react';
import { ContactDetailProvider } from '../ContactDetails/ContactDetailContext';
import { ContactDetails } from '../ContactDetails/ContactDetails';

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
