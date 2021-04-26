import { MockedProvider } from '@apollo/client/testing';
import React, { ReactElement } from 'react';

import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';

import { ContactTasksTab } from './ContactTasksTab';

export default {
  title: 'Contacts/Tab/ContactTasksTab',
  component: ContactTasksTab,
};

const accountListId = 'abc';
const contactId = 'contact-1';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider>
      <ContactTasksTab accountListId={accountListId} contactId={contactId} />
    </GqlMockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider>
      <ContactTasksTab accountListId={accountListId} contactId={contactId} />
    </MockedProvider>
  );
};
