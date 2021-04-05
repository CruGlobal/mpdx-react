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

const mockEnqueue = jest.fn();

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
