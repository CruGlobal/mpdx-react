import React from 'react';
import { InMemoryCache } from '@apollo/client';
import userEvent from '@testing-library/user-event';
import TestWrapper from '__tests__/util/TestWrapper';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import { GetNotificationsDocument } from './GetNotificationsQuery.generated';
import NotificationMenu from './NotificationMenu';
import {
  acknowledgeAllUserNotificationsMutationMock,
  getNotificationsEmptyMock,
  getNotificationsLoadingMock,
  getNotificationsMocks,
} from './NotificationMenu.mock';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: '1' },
      isReady: true,
    };
  },
}));

describe('NotificationMenu', () => {
  it('default', async () => {
    const cache = new InMemoryCache({ addTypename: false });
    jest.spyOn(cache, 'writeQuery');
    const { getByRole, queryByRole, queryByLabelText } = render(
      <TestWrapper
        mocks={[
          ...getNotificationsMocks(),
          acknowledgeAllUserNotificationsMutationMock(),
        ]}
        cache={cache}
      >
        <NotificationMenu />
      </TestWrapper>,
    );
    userEvent.click(getByRole('button'));
    await waitFor(() =>
      expect(
        getByRole('button', { hidden: true, name: 'Load More' }),
      ).toBeInTheDocument(),
    );
    expect(
      getByRole('button', {
        name: 'S Smith, Roger May 26, 2020 — Upcoming anniversary',
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', {
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
    await waitFor(() =>
      expect(cache.writeQuery).toHaveBeenCalledWith({
        query: GetNotificationsDocument,
        variables: {
          accountListId: '1',
          after: null,
        },
        data: {
          userNotifications: {
            nodes: [
              {
                id: 'd1b7a8c1-9b2e-4234-b2d6-e52c151bbc7b',
                read: true,
                notification: {
                  occurredAt: '2020-05-25T20:00:00-04:00',
                  contact: {
                    id: '942ea954-c251-44d6-8166-7a1879ecdbc7',
                    name: 'Smith, Roger',
                  },
                  donation: null,
                  notificationType: {
                    id: '6eb32493-c51b-490a-955d-595642160a95',
                    type: 'UPCOMING_ANNIVERSARY',
                    descriptionTemplate: 'Partner has upcoming anniversary',
                  },
                },
              },
              {
                id: '5055f90b-fb09-4bf2-bbcd-09f29aeb5147',
                read: true,
                notification: {
                  occurredAt: '2020-05-25T20:00:00-04:00',
                  contact: {
                    id: '942ea954-c251-44d6-8166-7a1879ecdbce',
                    name: 'Robertson, Tara',
                  },
                  donation: null,
                  notificationType: {
                    id: '577da384-5452-4501-9ec5-d5b2754d29ae',
                    type: 'UPCOMING_BIRTHDAY',
                    descriptionTemplate: 'Partner has upcoming birthday',
                  },
                },
              },
            ],
            pageInfo: { endCursor: 'Mg', hasNextPage: true },
            unreadCount: 0,
          },
        },
      }),
    );
    expect(queryByLabelText('Mark all as read')).not.toBeInTheDocument();
  });

  it('loading', async () => {
    const { getByRole, getByTestId } = render(
      <TestWrapper mocks={[getNotificationsLoadingMock()]}>
        <NotificationMenu />
      </TestWrapper>,
    );
    userEvent.click(getByRole('button'));
    await waitFor(() =>
      expect(getByTestId('NotificationMenuLoading')).toBeInTheDocument(),
    );
  });

  it('empty', async () => {
    const { getByRole, getByText } = render(
      <TestWrapper mocks={[getNotificationsEmptyMock()]}>
        <NotificationMenu />
      </TestWrapper>,
    );
    userEvent.click(getByRole('button'));
    await waitFor(() =>
      expect(getByText('No notifications to show.')).toBeInTheDocument(),
    );
  });
});
