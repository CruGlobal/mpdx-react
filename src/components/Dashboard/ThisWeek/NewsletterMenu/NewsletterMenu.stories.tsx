import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import {
  GetEmailNewsletterContactsQuery,
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
  const mocks = {
    GetEmailNewsletterContacts: {
      contacts: {
        nodes: [],
      },
    },

    GetTaskAnalytics: {
      taskAnalytics: {
        lastElectronicNewsletterCompletedAt: undefined,
        lastPhysicalNewsletterCompletedAt: undefined,
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
    error: { name: 'error', message: 'Error loading data. Try again.' },
  };
  return (
    <GqlMockedProvider<GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery>
      mocks={mocks}
    >
      <NewsletterMenu accountListId={accountListId} />
    </GqlMockedProvider>
  );
};
