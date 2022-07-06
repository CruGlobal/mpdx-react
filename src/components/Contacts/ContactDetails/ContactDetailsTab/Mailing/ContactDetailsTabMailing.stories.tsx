import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
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
