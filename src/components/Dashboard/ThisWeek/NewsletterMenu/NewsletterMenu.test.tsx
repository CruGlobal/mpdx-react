import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import NewsletterMenu from './NewsletterMenu';
import { GetTaskAnalyticsQuery } from './NewsletterMenu.generated';

const accountListId = '111';

describe('NewsletterMenu', () => {
  it('default', async () => {
    const { queryByText } = render(
      <GqlMockedProvider>
        <NewsletterMenu accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    expect(queryByText('Never')).toBeNull();
    expect(queryByText('Newsletter')).toBeVisible();
  });

  it('should open newsletter menu', async () => {
    const { queryByText, getByTestId } = render(
      <GqlMockedProvider>
        <NewsletterMenu accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    userEvent.click(getByTestId('NewsletterMenuButton'));

    expect(queryByText('Log Newsletter')).toBeInTheDocument();
    expect(queryByText('Export Email')).toBeInTheDocument();
    expect(queryByText('Export Physical')).toBeInTheDocument();
  });

  describe('Newsletter Date', () => {
    const createDateMock = (
      electronic: string | null,
      physical: string | null,
    ) => {
      return {
        GetTaskAnalytics: {
          taskAnalytics: {
            lastElectronicNewsletterCompletedAt: electronic,
            lastPhysicalNewsletterCompletedAt: physical,
          },
        },
      };
    };
    it('Shows most recent date out of two valid dates | Electronic', async () => {
      const { getByTestId } = render(
        <GqlMockedProvider<{ GetTaskAnalytics: GetTaskAnalyticsQuery }>
          mocks={createDateMock('2021-10-27T16:20:06Z', '2020-11-11T19:42:03Z')}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(getByTestId('NewsletterMenuButton').textContent).toEqual(
          'NewsletterLatest: Oct 27, 2021',
        ),
      );
    });

    it('Shows most recent date out of two valid dates | Physical', async () => {
      const { getByTestId } = render(
        <GqlMockedProvider<{ GetTaskAnalytics: GetTaskAnalyticsQuery }>
          mocks={createDateMock('2020-10-27T16:20:06Z', '2020-11-11T19:42:03Z')}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(getByTestId('NewsletterMenuButton').textContent).toEqual(
          'NewsletterLatest: Nov 11, 2020',
        ),
      );
    });

    it('Shows most recent date | Electronic', async () => {
      const { getByTestId } = render(
        <GqlMockedProvider<{ GetTaskAnalytics: GetTaskAnalyticsQuery }>
          mocks={createDateMock('2021-10-27T16:20:06Z', null)}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(getByTestId('NewsletterMenuButton').textContent).toEqual(
          'NewsletterLatest: Oct 27, 2021',
        ),
      );
    });

    it('Shows most recent date | Physical', async () => {
      const { getByTestId } = render(
        <GqlMockedProvider<{ GetTaskAnalytics: GetTaskAnalyticsQuery }>
          mocks={createDateMock(null, '2020-11-11T19:42:03Z')}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(getByTestId('NewsletterMenuButton').textContent).toEqual(
          'NewsletterLatest: Nov 11, 2020',
        ),
      );
    });

    it('Shows "never" if no date data', async () => {
      const { getByTestId } = render(
        <GqlMockedProvider<{ GetTaskAnalytics: GetTaskAnalyticsQuery }>
          mocks={createDateMock(null, null)}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(getByTestId('NewsletterMenuButton').textContent).toEqual(
          'NewsletterLatest: never',
        ),
      );
    });
  });
});
