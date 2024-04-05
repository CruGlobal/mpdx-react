import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  GetEmailNewsletterContactsDocument,
  GetEmailNewsletterContactsQuery,
} from './MenuItems/ExportEmail/GetNewsletterContacts.generated';
import NewsletterMenu from './NewsletterMenu';
import {
  GetTaskAnalyticsDocument,
  GetTaskAnalyticsQuery,
} from './NewsletterMenu.generated';

export default {
  title: 'Dashboard/ThisWeek/NewsletterMenu',
};

const accountListId = '111';

export const Default = (): ReactElement => {
  const mocks = {
    GetTaskAnalytics: {
      taskAnalytics: {
        lastElectronicNewsletterCompletedAt: '2020-10-27T16:20:06Z',
        lastPhysicalNewsletterCompletedAt: '2020-11-11T19:42:03Z',
      },
    },
  };
  return (
    <GqlMockedProvider<{ GetTaskAnalytics: GetTaskAnalyticsQuery }>
      mocks={mocks}
    >
      <NewsletterMenu accountListId={accountListId} />
    </GqlMockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GetTaskAnalyticsDocument,
            variables: {
              accountListId,
            },
          },
          result: {},
          delay: 100931731455,
        },
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
      <NewsletterMenu accountListId={accountListId} />
    </MockedProvider>
  );
};

interface EmptyMocks {
  GetTaskAnalytics: GetTaskAnalyticsQuery;
  GetEmailNewsletterContacts: GetEmailNewsletterContactsQuery;
}

export const Empty = (): ReactElement => {
  const mocks = {
    GetEmailNewsletterContacts: {
      contacts: {
        nodes: [],
      },
    },

    GetTaskAnalytics: {
      taskAnalytics: {
        lastElectronicNewsletterCompletedAt: null,
        lastPhysicalNewsletterCompletedAt: null,
      },
    },
  };
  return (
    <GqlMockedProvider<EmptyMocks> mocks={mocks}>
      <NewsletterMenu accountListId={accountListId} />
    </GqlMockedProvider>
  );
};

export const Error = (): ReactElement => {
  const mocks = {
    GetEmailNewsletterContacts: {
      contacts: new GraphQLError('Graphql Error #42: Error loading contacts'),
    },

    GetTaskAnalytics: {
      taskAnalytics: new GraphQLError(
        'Graphql Error #42: Error loading task newsletter date data',
      ),
    },
  };
  return (
    <GqlMockedProvider mocks={mocks}>
      <NewsletterMenu accountListId={accountListId} />
    </GqlMockedProvider>
  );
};
