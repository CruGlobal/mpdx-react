import React from 'react';
import { ApolloCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { CreateContactAddressMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/AddAddressModal/CreateContactAddress.generated';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { ConfirmAddresses } from './ConfirmAddresses';
import { InvalidAddressesQuery } from './GetInvalidAddresses.generated';

export const accountListId = 'account-list-1';
export const contactId = 'contactId';
const router = {
  pathname:
    '/accountLists/[accountListId]/tools/mailingAddresses/[[...contactId]]',
  query: { accountListId },
};

export const Components = ({
  mocks,
  cache,
  onCall,
}: {
  mocks: ApolloErgonoMockMap;
  cache?: ApolloCache<object>;
  onCall?: jest.Mock;
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          InvalidAddresses: InvalidAddressesQuery;
          CreateContactAddress: CreateContactAddressMutation;
        }>
          mocks={mocks}
          cache={cache}
          onCall={onCall}
        >
          <ContactPanelProvider>
            <ConfirmAddresses accountListId={accountListId} />
          </ContactPanelProvider>
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);
