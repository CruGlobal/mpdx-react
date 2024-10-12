import { useRouter } from 'next/router';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import { AppSettingsProvider } from 'src/components/common/AppSettings/AppSettingsProvider';
import i18n from 'src/lib/i18n';
import AcceptInvitePage from './acceptInvite.page';
import 'node-fetch';

jest.mock('node-fetch', () => jest.fn());

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

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
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      isReady: true,
      query: {
        accountListId: 'test-account-list-id',
        inviteCode: 'test-invite-code',
        accountInviteId: null,
        orgInviteId: null,
        orgId: null,
      },
      push: mockPush,
    });

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renders the page and accepts an invite', async () => {
    (useRouter as jest.Mock).mockReturnValueOnce({
      isReady: true,
      query: {
        accountListId: 'test-account-list-id',
        inviteCode: 'test-invite-code',
        accountInviteId: 'test-invite-id',
      },
      push: mockPush,
    });
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({}),
    });

    const { getByText } = render(
      <AppSettingsProvider>
        <I18nextProvider i18n={i18n}>
          <SnackbarProvider>
            <AcceptInvitePage />
          </SnackbarProvider>
        </I18nextProvider>
      </AppSettingsProvider>,
    );

    expect(getByText(/You will be redirected soon/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Accepted invite successfully.',
        { variant: 'success' },
      );
      expect(mockPush).toHaveBeenCalledWith(
        '/accountLists/test-account-list-id/',
      );
    });
  });

  it('handles invite acceptance error', async () => {
    (useRouter as jest.Mock).mockReturnValueOnce({
      isReady: true,
      query: {
        accountListId: 'test-account-list-id',
        inviteCode: 'test-invite-code',
        accountInviteId: 'another-invite-id',
      },
      push: mockPush,
    });
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({}),
    });

    render(
      <AppSettingsProvider>
        <I18nextProvider i18n={i18n}>
          <SnackbarProvider>
            <AcceptInvitePage />
          </SnackbarProvider>
        </I18nextProvider>
      </AppSettingsProvider>,
    );

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Unable to accept invite. Try asking the account holder to resend the invite.',
        { variant: 'error' },
      );
    });
  });

  it('redirects to preferences settings for organization invites', async () => {
    (useRouter as jest.Mock).mockReturnValueOnce({
      isReady: true,
      query: {
        accountListId: 'test-account-list-id',
        inviteCode: 'test-invite-code',
        orgInviteId: 'test-org-invite-id',
        orgId: 'test-org-id',
      },
      push: mockPush,
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({}),
    });

    const { getByText } = render(
      <AppSettingsProvider>
        <I18nextProvider i18n={i18n}>
          <SnackbarProvider>
            <AcceptInvitePage />
          </SnackbarProvider>
        </I18nextProvider>
      </AppSettingsProvider>,
    );

    expect(getByText(/You will be redirected soon/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Accepted invite successfully.',
        { variant: 'success' },
      );
      expect(mockPush).toHaveBeenCalledWith(
        '/accountLists/test-account-list-id/settings/preferences',
      );
    });
  });
});
