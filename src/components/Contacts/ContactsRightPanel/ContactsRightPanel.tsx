import React from 'react';
import { ContactDetails } from '../ContactDetails/ContactDetails';
import { ContactDetailProvider } from '../ContactDetails/ContactDetailContext';

export const ContactsRightPanel: React.FC = () => {
  return (
    <ContactDetailProvider>
      <ContactDetails />
    </ContactDetailProvider>
  );
};
