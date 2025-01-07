import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { AppSettingsProvider } from 'src/components/common/AppSettings/AppSettingsProvider';
import i18n from 'src/lib/i18n';
import AcceptInvitePage from './acceptInvite.page';
import 'node-fetch';

jest.mock('node-fetch', () => jest.fn());
jest.mock('src/hooks/useAccountListId');
const mockPush = jest.fn();
const dashboardLink = '/accountLists/_/';

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

describe('AcceptInvitePage', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renders the page and accepts an invite', async () => {
    const router = {
      isReady: true,
      query: {
        accountListId: 'test-account-list-id',
        inviteCode: 'test-invite-code',
        accountInviteId: 'test-invite-id',
      },
      push: mockPush,
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({}),
    });

    const { getByText } = render(
      <TestRouter router={router}>
        <AppSettingsProvider>
          <I18nextProvider i18n={i18n}>
            <SnackbarProvider>
              <AcceptInvitePage />
            </SnackbarProvider>
          </I18nextProvider>
        </AppSettingsProvider>
      </TestRouter>,
    );

    expect(getByText(/You will be redirected soon.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Accepted invite successfully.',
        { variant: 'success' },
      );
      expect(mockPush).toHaveBeenCalledWith(dashboardLink);
    });
  });

  it('redirects to preferences settings for organization invites', async () => {
    const router = {
      isReady: true,
      query: {
        accountListId: 'test-account-list-id',
        inviteCode: 'test-invite-code',
        orgInviteId: 'test-org-invite-id',
        orgId: 'test-org-id',
      },
      push: mockPush,
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({}),
    });

    const { getByText } = render(
      <TestRouter router={router}>
        <AppSettingsProvider>
          <I18nextProvider i18n={i18n}>
            <SnackbarProvider>
              <AcceptInvitePage />
            </SnackbarProvider>
          </I18nextProvider>
        </AppSettingsProvider>
      </TestRouter>,
    );

    expect(getByText(/You will be redirected soon/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Accepted invite successfully.',
        { variant: 'success' },
      );
      expect(mockPush).toHaveBeenCalledWith(
        `${dashboardLink}settings/integrations?selectedTab=organization`,
      );
    });
  });

  it('handles invite acceptance error', async () => {
    const router = {
      isReady: true,
      query: {
        accountListId: 'test-account-list-id',
        inviteCode: 'test-invite-code',
        accountInviteId: 'another-invite-id',
      },
      push: mockPush,
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({}),
    });

    render(
      <TestRouter router={router}>
        <AppSettingsProvider>
          <I18nextProvider i18n={i18n}>
            <SnackbarProvider>
              <AcceptInvitePage />
            </SnackbarProvider>
          </I18nextProvider>
        </AppSettingsProvider>
      </TestRouter>,
    );

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Unable to accept invite. Try asking the account holder to resend the invite.',
        { variant: 'error' },
      );
    });
  });

  it('handles invalid url props', async () => {
    const router = {
      isReady: true,
      query: {
        accountListId: '',
        inviteCode: 'test-invite-code',
        accountInviteId: 'another-invite-id',
      },
      push: mockPush,
    };

    render(
      <TestRouter router={router}>
        <AppSettingsProvider>
          <I18nextProvider i18n={i18n}>
            <SnackbarProvider>
              <AcceptInvitePage />
            </SnackbarProvider>
          </I18nextProvider>
        </AppSettingsProvider>
      </TestRouter>,
    );

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Invalid invite URL. Try asking the inviter to resend the invite.',
        { variant: 'error' },
      );
    });
    expect(mockPush).toHaveBeenCalledWith(dashboardLink);
  });
});
