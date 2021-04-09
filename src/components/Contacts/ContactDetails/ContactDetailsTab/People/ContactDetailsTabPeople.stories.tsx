import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
  ContactDetailsTabQueryVariables,
} from '../ContactDetailsTab.generated';
import { ContactDetailsTabPeople } from './ContactDetailsTabPeople';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/People',
  component: ContactDetailsTabPeople,
};

export const Default = (): ReactElement => {
  const mock = gqlMock<ContactDetailsTabQuery, ContactDetailsTabQueryVariables>(
    ContactDetailsTabDocument,
    {
      variables: { accountListId: '111', contactId: '222' },
    },
  );
  return (
    <Box m={2}>
      <ContactDetailsTabPeople data={mock} />
    </Box>
  );
};
