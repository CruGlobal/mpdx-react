import React from 'react';
import { InMemoryCache } from '@apollo/client';
import { MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import TestWrapper from '__tests__/util/TestWrapper';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
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

interface ThemedMenuProps {
  mocks: MockedResponse[];
  isInDrawer?: boolean;
}

const ThemedMenu: React.FC<ThemedMenuProps> = ({ mocks, isInDrawer }) => (
  <ThemeProvider theme={theme}>
    <TestWrapper mocks={mocks}>
      <NotificationMenu isInDrawer={isInDrawer} />
    </TestWrapper>
  </ThemeProvider>
);

// jsdom can't resolve CSS var(), so read the palette color MUI passes to the
// button through its --variant-*Color variable instead of the computed color
const buttonColor = (button: HTMLElement, variant: 'text' | 'outlined') =>
  window.getComputedStyle(button).getPropertyValue(`--variant-${variant}Color`);

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

  describe('in the side menu drawer', () => {
    it('shows only Mark all as read in a dark header, without a second Notifications title', async () => {
      const { findByRole, getByRole, queryByText, queryByRole } = render(
        <ThemedMenu mocks={getNotificationsMocks()} isInDrawer />,
      );

      expect(
        await findByRole('link', {
          name: 'S Smith, Roger May 26, 2020 — Upcoming anniversary',
        }),
      ).toBeInTheDocument();
      expect(queryByText('Notifications')).not.toBeInTheDocument();
      expect(
        queryByRole('button', { name: /^Notifications/ }),
      ).not.toBeInTheDocument();

      const header = getByRole('button', { name: 'Mark all as read' }).closest(
        '.MuiListSubheader-root',
      );
      expect(header).toHaveStyle({
        backgroundColor: 'rgb(56, 63, 67)',
        zIndex: '2',
        paddingRight: '8px',
      });
    });

    it('makes Mark all as read yellow with a 44px tap target', async () => {
      const { findByRole } = render(
        <ThemedMenu mocks={getNotificationsMocks()} isInDrawer />,
      );

      const markAllButton = await findByRole('button', {
        name: 'Mark all as read',
      });
      await waitFor(() => expect(markAllButton).not.toBeDisabled());
      expect(buttonColor(markAllButton, 'text')).toBe('#FFD000');
      expect(markAllButton).toHaveStyle({ minHeight: '44px' });
    });

    it('keeps a disabled Mark all as read readable in medium gray', async () => {
      const { findByText, getByRole } = render(
        <ThemedMenu mocks={[getNotificationsEmptyMock()]} isInDrawer />,
      );

      expect(await findByText('No notifications to show.')).toBeInTheDocument();
      const markAllButton = getByRole('button', { name: 'Mark all as read' });
      expect(markAllButton).toBeDisabled();
      expect(markAllButton).toHaveStyle({ color: 'rgb(156, 159, 161)' });
    });

    it('shows the empty message in white under the picture', async () => {
      const { findByText, getByRole } = render(
        <ThemedMenu mocks={[getNotificationsEmptyMock()]} isInDrawer />,
      );

      const emptyMessage = await findByText('No notifications to show.');
      expect(emptyMessage).toHaveStyle({ color: 'rgb(255, 255, 255)' });
      expect(getByRole('img', { name: 'empty' })).toBeInTheDocument();
    });

    it('makes the Load More button yellow', async () => {
      const { findByRole } = render(
        <ThemedMenu mocks={getNotificationsMocks()} isInDrawer />,
      );

      const loadMoreButton = await findByRole('button', { name: 'Load More' });
      expect(buttonColor(loadMoreButton, 'outlined')).toBe('#FFD000');
    });
  });

  describe('in the top bar menu', () => {
    it('keeps the Notifications title and the white header', async () => {
      const { getByRole, findByRole, getByText } = render(
        <ThemedMenu mocks={getNotificationsMocks()} />,
      );

      userEvent.click(getByRole('button', { name: 'Notifications' }));

      const markAllButton = await findByRole('button', {
        hidden: true,
        name: 'Mark all as read',
      });
      expect(getByText('Notifications')).toBeInTheDocument();
      expect(markAllButton.closest('.MuiListSubheader-root')).toHaveStyle({
        backgroundColor: 'rgb(255, 255, 255)',
      });
      await waitFor(() => expect(markAllButton).not.toBeDisabled());
      expect(buttonColor(markAllButton, 'text')).toBe('#05699B');
      expect(markAllButton).not.toHaveStyle({ minHeight: '44px' });
    });

    it('does not force the empty message to white', async () => {
      const { getByRole, findByText } = render(
        <ThemedMenu mocks={[getNotificationsEmptyMock()]} />,
      );

      userEvent.click(getByRole('button', { name: 'Notifications' }));

      const emptyMessage = await findByText('No notifications to show.');
      expect(emptyMessage).not.toHaveStyle({ color: 'rgb(255, 255, 255)' });
    });

    it('keeps the Load More button in the inherited text color', async () => {
      const { getByRole, findByRole } = render(
        <ThemedMenu mocks={getNotificationsMocks()} />,
      );

      userEvent.click(getByRole('button', { name: 'Notifications' }));

      const loadMoreButton = await findByRole('button', {
        hidden: true,
        name: 'Load More',
      });
      // No palette color is set, so the button inherits the menu's text color
      expect(buttonColor(loadMoreButton, 'outlined')).toBe('');
    });
  });
});
