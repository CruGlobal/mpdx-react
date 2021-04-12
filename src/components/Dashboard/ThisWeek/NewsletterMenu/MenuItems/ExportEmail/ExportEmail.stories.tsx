import { MockedProvider } from '@apollo/client/testing';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import ExportEmail from './ExportEmail';
import {
  GetEmailNewsletterContactsDocument,
  GetEmailNewsletterContactsQuery,
} from './GetNewsletterContacts.generated';

export default {
  title: 'Dashboard/ThisWeek/NewsletterMenu/MenuItems/ExportEmail',
};

const accountListId = '111';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<GetEmailNewsletterContactsQuery>>
      <ExportEmail accountListId={accountListId} handleClose={() => {}} />
    </GqlMockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GetEmailNewsletterContactsDocument,
            variables: {
              accountListId,
            },
          },
          result: {},
          delay: 100931731455,
        },
      ]}
    >
      <ExportEmail accountListId={accountListId} handleClose={() => {}} />
    </MockedProvider>
  );
};

export const Empty = (): ReactElement => {
  const mocks = {
    GetEmailNewsletterContacts: {
      contacts: {
        nodes: [],
      },
    },
  };
  return (
    <GqlMockedProvider<GetEmailNewsletterContactsQuery> mocks={mocks}>
      <ExportEmail accountListId={accountListId} handleClose={() => {}} />
    </GqlMockedProvider>
  );
};
