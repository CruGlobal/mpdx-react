import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import {
  GetEmailNewsletterContactsQuery,
  GetTaskAnalyticsQuery,
} from '../NewsletterMenu.generated';
import NewsletterMenu from './NewsletterMenu';

const accountListId = '111';

describe('NewsletterMenu', () => {
  it('default', async () => {
    const { queryByText } = render(
      <GqlMockedProvider<
        GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery
      >>
        <NewsletterMenu accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    expect(queryByText('Never')).toBeNull();
    expect(queryByText('Newsletter')).toBeVisible();
  });

  it('should open newsletter menu', async () => {
    const { queryByText, queryByTestId } = render(
      <GqlMockedProvider<
        GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery
      >>
        <NewsletterMenu accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    userEvent.click(queryByTestId('NewsletterMenuButton'));

    expect(queryByText('Log Newsletter')).toBeInTheDocument();
    expect(queryByText('Export Email')).toBeInTheDocument();
    expect(queryByText('Export Physical')).toBeInTheDocument();
  });

  describe('Newsletter Date', () => {
    it('Shows most recent date out of two valid dates | Electronic', async () => {
      const mocks = {
        GetTaskAnalytics: {
          taskAnalytics: {
            lastElectronicNewsletterCompletedAt: '2021-10-27T16:20:06Z',
            lastPhysicalNewsletterCompletedAt: '2020-11-11T19:42:03Z',
          },
        },
      };
      const { queryByTestId } = render(
        <GqlMockedProvider<
          GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery
        >
          mocks={mocks}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(
          queryByTestId('NewsletterMenuButton').textContent,
        ).not.toBeNull(),
      );
      expect(queryByTestId('NewsletterMenuButton').textContent).toEqual(
        'NewsletterLatest: 10/27/2021',
      );
    });

    it('Shows most recent date out of two valid dates | Physical', async () => {
      const mocks = {
        GetTaskAnalytics: {
          taskAnalytics: {
            lastElectronicNewsletterCompletedAt: '2020-10-27T16:20:06Z',
            lastPhysicalNewsletterCompletedAt: '2020-11-11T19:42:03Z',
          },
        },
      };
      const { queryByTestId } = render(
        <GqlMockedProvider<
          GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery
        >
          mocks={mocks}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(
          queryByTestId('NewsletterMenuButton').textContent,
        ).not.toBeNull(),
      );
      expect(queryByTestId('NewsletterMenuButton').textContent).toEqual(
        'NewsletterLatest: 11/11/2020',
      );
    });

    it('Shows most recent date | Electronic', async () => {
      const mocks = {
        GetTaskAnalytics: {
          taskAnalytics: {
            lastElectronicNewsletterCompletedAt: '2021-10-27T16:20:06Z',
            lastPhysicalNewsletterCompletedAt: null,
          },
        },
      };
      const { queryByTestId } = render(
        <GqlMockedProvider<
          GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery
        >
          mocks={mocks}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(
          queryByTestId('NewsletterMenuButton').textContent,
        ).not.toBeNull(),
      );
      expect(queryByTestId('NewsletterMenuButton').textContent).toEqual(
        'NewsletterLatest: 10/27/2021',
      );
    });

    it('Shows most recent date | Physical', async () => {
      const mocks = {
        GetTaskAnalytics: {
          taskAnalytics: {
            lastElectronicNewsletterCompletedAt: null,
            lastPhysicalNewsletterCompletedAt: '2020-11-11T19:42:03Z',
          },
        },
      };
      const { queryByTestId } = render(
        <GqlMockedProvider<
          GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery
        >
          mocks={mocks}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(
          queryByTestId('NewsletterMenuButton').textContent,
        ).not.toBeNull(),
      );
      expect(queryByTestId('NewsletterMenuButton').textContent).toEqual(
        'NewsletterLatest: 11/11/2020',
      );
    });

    it('Shows "never" if no date data', async () => {
      const mocks = {
        GetTaskAnalytics: {
          taskAnalytics: {
            lastElectronicNewsletterCompletedAt: null,
            lastPhysicalNewsletterCompletedAt: null,
          },
        },
      };
      const { queryByTestId } = render(
        <GqlMockedProvider<
          GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery
        >
          mocks={mocks}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(
          queryByTestId('NewsletterMenuButton').textContent,
        ).not.toBeNull(),
      );

      expect(queryByTestId('NewsletterMenuButton').textContent).toEqual(
        'NewsletterLatest: never',
      );
    });
  });

  describe('Log Newsletter', () => {
    it('should open Log Newsletter menu', () => {
      const { queryByText, queryByTestId } = render(
        <GqlMockedProvider<
          GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery
        >>
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );

      userEvent.click(queryByTestId('NewsletterMenuButton'));
      userEvent.click(queryByText('Log Newsletter'));

      expect(
        queryByText('Log Newsletter placeholder text'),
      ).toBeInTheDocument();
    });

    it('should close Log Newsletter menu', () => {
      const { queryByText, queryByTestId, queryByRole } = render(
        <GqlMockedProvider<
          GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery
        >>
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );

      userEvent.click(queryByTestId('NewsletterMenuButton'));
      userEvent.click(queryByText('Log Newsletter'));

      expect(
        queryByText('Log Newsletter placeholder text'),
      ).toBeInTheDocument();

      userEvent.click(queryByRole('closeButton'));

      expect(
        queryByText('Log Newsletter placeholder text'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Export Email', () => {
    it('should open Export Email dialog', async () => {
      const email1 = 'fakeemail1@fake.com';
      const email2 = 'fakeemail2@fake.com';

      const mocks = {
        GetEmailNewsletterContacts: {
          contacts: {
            nodes: [
              {
                primaryPerson: {
                  primaryEmailAddress: {
                    email: email1,
                  },
                },
              },
              {
                primaryPerson: {
                  primaryEmailAddress: {
                    email: email2,
                  },
                },
              },
              {
                primaryPerson: null,
              },
            ],
          },
        },
      };
      const { queryByText, queryByTestId } = render(
        <GqlMockedProvider<
          GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery
        >
          mocks={mocks}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );

      userEvent.click(queryByTestId('NewsletterMenuButton'));
      userEvent.click(queryByText('Export Email'));

      expect(queryByText('Copy All')).toBeInTheDocument();
      await waitFor(() => expect(queryByTestId('emailList')).not.toBeNull());
      expect(queryByTestId('emailList')).toHaveValue(`${email1},${email2}`);
    });
  });

  it('should copy email list to clipboard', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: () => {},
      },
    });
    const email1 = 'fakeemail1@fake.com';
    const email2 = 'fakeemail2@fake.com';
    jest.spyOn(navigator.clipboard, 'writeText');
    const mocks = {
      GetEmailNewsletterContacts: {
        contacts: {
          nodes: [
            {
              primaryPerson: {
                primaryEmailAddress: {
                  email: email1,
                },
              },
            },
            {
              primaryPerson: {
                primaryEmailAddress: {
                  email: email2,
                },
              },
            },
          ],
        },
      },
    };
    const { queryByText, queryByTestId } = render(
      <GqlMockedProvider<
        GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery
      >
        mocks={mocks}
      >
        <NewsletterMenu accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    userEvent.click(queryByTestId('NewsletterMenuButton'));
    userEvent.click(queryByText('Export Email'));

    await waitFor(() => expect(queryByTestId('emailList')).not.toBeNull());
    userEvent.click(queryByText('Copy All'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `${email1},${email2}`,
    );
  });

  describe('Export Physical', () => {
    it('should open Export Physical menu', () => {
      const { queryByText, queryByTestId } = render(
        <GqlMockedProvider<
          GetTaskAnalyticsQuery & GetEmailNewsletterContactsQuery
        >>
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );

      userEvent.click(queryByTestId('NewsletterMenuButton'));
      userEvent.click(queryByText('Export Physical'));

      expect(queryByText('Export Contacts')).toBeInTheDocument();
    });
  });
});
