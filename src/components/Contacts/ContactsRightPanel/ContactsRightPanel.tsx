import React from 'react';
import { ContactContextTypesEnum } from 'src/lib/contactContextTypes';
import { ContactDetailProvider } from '../ContactDetails/ContactDetailContext';
import { ContactDetails } from '../ContactDetails/ContactDetails';

interface Props {
  contextType?: ContactContextTypesEnum;
}
export const ContactsRightPanel: React.FC<Props> = ({ contextType }) => {
  return (
    <ContactDetailProvider>
      <ContactDetails contextType={contextType} />
    </ContactDetailProvider>
  );
};
