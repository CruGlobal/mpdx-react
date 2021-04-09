import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { ContactDetailsTabQuery } from '../ContactDetailsTab.generated';
import { ContactTags } from './ContactTags';
import { GetContactTagsDocument } from './ContactTags.generated';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/ContactTags',
  component: ContactTags,
};
const accountListId = '111';
const contactId = '222';
export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <GqlMockedProvider<ContactDetailsTabQuery>>
        <ContactTags accountListId={accountListId} contactId={contactId} />
      </GqlMockedProvider>
    </Box>
  );
};

export const EmptyTags = (): ReactElement => {
  return (
    <Box m={2}>
      <MockedProvider
        mocks={[
          {
            request: {
              query: GetContactTagsDocument,
              variables: {
                accountListID: accountListId,
                contactId: contactId,
              },
            },
            result: {},
            delay: 8640000,
          },
        ]}
      >
        <ContactTags accountListId={accountListId} contactId={contactId} />
      </MockedProvider>
    </Box>
  );
};
