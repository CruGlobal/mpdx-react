import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
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
      <ContactDetailsOther contact={mock} onContactSelected={() => {}} />
    </Box>
  );
};
