import React, { ReactElement } from 'react';
import { Box } from '@mui/material';
import { gqlMock } from '__tests__/util/graphqlMocking';
import { ContactDetailProvider } from '../../ContactDetailContext';
import { ContactDetailsTabMailing } from './ContactDetailsTabMailing';
import {
  ContactMailingFragment,
  ContactMailingFragmentDoc,
} from './ContactMailing.generated';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/Mailing',
};

export const Default = (): ReactElement => {
  const mock = gqlMock<ContactMailingFragment>(ContactMailingFragmentDoc);
  return (
    <Box m={2}>
      <ContactDetailProvider>
        <ContactDetailsTabMailing accountListId={'123'} data={mock} />
      </ContactDetailProvider>
    </Box>
  );
};
