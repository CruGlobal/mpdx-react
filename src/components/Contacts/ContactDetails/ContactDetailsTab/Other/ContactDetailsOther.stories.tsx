import { Box } from '@mui/material';
import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import { ContactDetailProvider } from '../../ContactDetailContext';
import { ContactDetailsOther } from './ContactDetailsOther';
import {
  ContactOtherFragment,
  ContactOtherFragmentDoc,
} from './ContactOther.generated';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/Other',
  component: ContactDetailsOther,
};

export const Default = (): ReactElement => {
  const mock = gqlMock<ContactOtherFragment>(ContactOtherFragmentDoc);
  return (
    <Box m={2}>
      <ContactDetailProvider>
        <ContactDetailsOther contact={mock} onContactSelected={() => {}} />
      </ContactDetailProvider>
    </Box>
  );
};
