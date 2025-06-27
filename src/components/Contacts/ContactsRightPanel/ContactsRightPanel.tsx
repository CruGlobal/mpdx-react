import React from 'react';
import { ContactDetailProvider } from '../ContactDetails/ContactDetailContext';
import { ContactDetails } from '../ContactDetails/ContactDetails';

export const ContactsRightPanel: React.FC = () => {
  return (
    <ContactDetailProvider>
      <ContactDetails />
    </ContactDetailProvider>
  );
};
