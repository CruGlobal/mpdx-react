import React from 'react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import { GetNotificationsQuery } from './GetNotificationsQuery.generated';
import NotificationMenu from './NotificationMenu';
import {
  notificationsEmptyMockData,
  notificationsQueryMockData,
} from './NotificationMenu.mock';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: '1' },
      isReady: true,
    };
  },
}));

const mutationSpy = jest.fn();

describe('NotificationMenu', () => {
  it('default', async () => {
    const { getByRole, queryByRole, queryByLabelText } = render(
      <GqlMockedProvider<{
        GetNotifications: GetNotificationsQuery;
      }>
        mocks={{
          GetNotifications: {
            ...notificationsQueryMockData,
          },
        }}
        onCall={mutationSpy}
      >
        <NotificationMenu />
      </GqlMockedProvider>,
    );
    userEvent.click(getByRole('button'));
    await waitFor(() =>
      expect(
        getByRole('button', { hidden: true, name: 'Load More' }),
      ).toBeInTheDocument(),
    );
    expect(
      getByRole('link', {
        name: 'S Smith, Roger May 26, 2020 — Upcoming anniversary',
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('link', {
        name: 'R Robertson, Tara May 26, 2020 — Upcoming birthday',
      }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { hidden: true, name: 'Load More' }));
    await waitFor(() =>
      expect(
        queryByRole('button', { hidden: true, name: 'Load More' }),
      ).not.toBeInTheDocument(),
    );
    userEvent.click(
      getByRole('button', { hidden: true, name: 'Mark all as read' }),
    );
    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'AcknowledgeAllUserNotifications',
      );

      expect(mutationSpy).toHaveGraphqlOperation('GetNotifications', {
        accountListId: '1',
        after: null,
      });
    });
    expect(queryByLabelText('Mark all as read')).not.toBeInTheDocument();
  });

  it('empty', async () => {
    const { getByRole, getByText } = render(
      <GqlMockedProvider<{
        GetNotifications: GetNotificationsQuery;
      }>
        mocks={{
          GetNotifications: {
            ...notificationsEmptyMockData,
          },
        }}
        onCall={mutationSpy}
      >
        <NotificationMenu />
      </GqlMockedProvider>,
    );
    userEvent.click(getByRole('button'));
    await waitFor(() =>
      expect(getByText('No notifications to show.')).toBeInTheDocument(),
    );
  });
});
