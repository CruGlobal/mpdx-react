import React from 'react';
import { ContactContextTypesEnum } from 'src/lib/contactContextTypes';
import { ContactDetailProvider } from '../ContactDetails/ContactDetailContext';
import { ContactDetails } from '../ContactDetails/ContactDetails';

interface Props {
  onClose: () => void;
  contextType?: ContactContextTypesEnum;
}
export const ContactsRightPanel: React.FC<Props> = ({
  onClose,
  contextType,
}) => {
  return (
    <ContactDetailProvider>
      <ContactDetails onClose={onClose} contextType={contextType} />
    </ContactDetailProvider>
  );
};
