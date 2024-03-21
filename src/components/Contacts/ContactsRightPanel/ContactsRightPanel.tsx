import React from 'react';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { ContactDetailProvider } from '../ContactDetails/ContactDetailContext';
import { ContactDetails } from '../ContactDetails/ContactDetails';

interface Props {
  onClose: () => void;
}
export const ContactsRightPanel: React.FC<Props> = ({ onClose }) => {
  return (
    <ContactsWrapper>
      <ContactDetailProvider>
        <ContactDetails onClose={onClose} />
      </ContactDetailProvider>
    </ContactsWrapper>
  );
};
