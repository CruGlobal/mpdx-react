import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { GetTaskAnalyticsQuery } from './NewsletterMenu.generated';
import NewsletterMenu from './NewsletterMenu';

const accountListId = '111';

describe('NewsletterMenu', () => {
  it('default', async () => {
    const { queryByText } = render(
      <GqlMockedProvider<GetTaskAnalyticsQuery>>
        <NewsletterMenu accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    expect(queryByText('Never')).toBeNull();
    expect(queryByText('Newsletter')).toBeVisible();
  });

  it('should open newsletter menu', async () => {
    const { queryByText, getByTestId } = render(
      <GqlMockedProvider<GetTaskAnalyticsQuery>>
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
    it.skip('Shows most recent date out of two valid dates | Electronic', async () => {
      const { getByTestId } = render(
        <GqlMockedProvider<GetTaskAnalyticsQuery>
          mocks={createDateMock('2021-10-27T16:20:06Z', '2020-11-11T19:42:03Z')}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(getByTestId('NewsletterMenuButton').textContent).not.toBeNull(),
      );
      expect(getByTestId('NewsletterMenuButton').textContent).toEqual(
        'NewsletterLatest: 10/27/2021',
      );
    });

    it.skip('Shows most recent date out of two valid dates | Physical', async () => {
      const { getByTestId } = render(
        <GqlMockedProvider<GetTaskAnalyticsQuery>
          mocks={createDateMock('2020-10-27T16:20:06Z', '2020-11-11T19:42:03Z')}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(getByTestId('NewsletterMenuButton').textContent).not.toBeNull(),
      );
      expect(getByTestId('NewsletterMenuButton').textContent).toEqual(
        'NewsletterLatest: 11/11/2020',
      );
    });

    it.skip('Shows most recent date | Electronic', async () => {
      const { getByTestId } = render(
        <GqlMockedProvider<GetTaskAnalyticsQuery>
          mocks={createDateMock('2021-10-27T16:20:06Z', null)}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(getByTestId('NewsletterMenuButton').textContent).not.toBeNull(),
      );
      expect(getByTestId('NewsletterMenuButton').textContent).toEqual(
        'NewsletterLatest: 10/27/2021',
      );
    });

    it.skip('Shows most recent date | Physical', async () => {
      const { getByTestId } = render(
        <GqlMockedProvider<GetTaskAnalyticsQuery>
          mocks={createDateMock(null, '2020-11-11T19:42:03Z')}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(getByTestId('NewsletterMenuButton').textContent).not.toBeNull(),
      );
      expect(getByTestId('NewsletterMenuButton').textContent).toEqual(
        'NewsletterLatest: 11/11/2020',
      );
    });

    it.skip('Shows "never" if no date data', async () => {
      const { getByTestId } = render(
        <GqlMockedProvider<GetTaskAnalyticsQuery>
          mocks={createDateMock(null, null)}
        >
          <NewsletterMenu accountListId={accountListId} />
        </GqlMockedProvider>,
      );
      await waitFor(() =>
        expect(getByTestId('NewsletterMenuButton').textContent).not.toBeNull(),
      );

      expect(getByTestId('NewsletterMenuButton').textContent).toEqual(
        'NewsletterLatest: never',
      );
    });
  });
});
