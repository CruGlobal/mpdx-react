import { MockedProvider } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import {
  GetEmailNewsletterContactsDocument,
  GetEmailNewsletterContactsQuery,
  GetTaskAnalyticsDocument,
  GetTaskAnalyticsQuery,
} from '../NewsletterMenu.generated';
import NewsletterMenu from './NewsletterMenu';

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
    <GqlMockedProvider<GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery>
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
    <GqlMockedProvider<GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery>
      mocks={mocks}
    >
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
    <GqlMockedProvider<GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery>
      mocks={mocks}
    >
      <NewsletterMenu accountListId={accountListId} />
    </GqlMockedProvider>
  );
};
