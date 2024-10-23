import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { Box } from '@mui/material';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactReferralTab } from './ContactReferralTab';
import { ContactReferralTabDocument } from './ContactReferralTab.generated';

export default {
  title: 'Contacts/Tab/ContactReferralTab',
  component: ContactReferralTab,
};

const accountListId = '1111';
const contactId = '2222';

export const Default = (): ReactElement => {
  return (
    <Box m="2">
      <GqlMockedProvider>
        <ContactReferralTab
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>
    </Box>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: ContactReferralTabDocument,
            variables: {
              accountListId: accountListId,
              contactId: contactId,
            },
          },
          result: {},
          delay: 8640000,
        },
      ]}
    >
      <ContactReferralTab accountListId={accountListId} contactId={contactId} />
    </MockedProvider>
  );
};
