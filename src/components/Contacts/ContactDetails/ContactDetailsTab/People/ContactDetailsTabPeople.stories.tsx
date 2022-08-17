import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import { ContactDetailProvider } from '../../ContactDetailContext';
import { ContactDetailsTabPeople } from './ContactDetailsTabPeople';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from './ContactPeople.generated';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/People',
  component: ContactDetailsTabPeople,
};

export const Default = (): ReactElement => {
  const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc);
  const accountListId = '123';
  return (
    <Box m={2}>
      <ContactDetailProvider>
        <ContactDetailsTabPeople accountListId={accountListId} data={mock} />
      </ContactDetailProvider>
    </Box>
  );
};
