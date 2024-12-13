import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { SetupPage } from 'src/components/Setup/SetupPage';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { ensureSessionAndAccountList } from './api/utils/pagePropsHelpers';

interface FetchAcceptInviteProps {
  apiToken: string;
  url: string;
  inviteType: string;
  id: string;
  code: string;
}

export const fetchAcceptInvite = ({
  apiToken,
  url,
  inviteType,
  id,
  code,
}: FetchAcceptInviteProps): Promise<Response> => {
  return fetch(process.env.REST_API_URL + url, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${apiToken}`,
      'content-type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: inviteType,
        id,
        attributes: { code },
      },
    }),
  });
};

const AcceptInvitePage = (): ReactElement => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const query = router.query;
  const session = useRequiredSession();

  // Ref to track if the API call has already been triggered
  const hasFetchedRef = useRef(false);
  // Since we don't have the user's accountListId, use an invalid accountListId so the page redirects on it's own.
  const dashboardLink = '/accountLists/_/';

  useEffect(() => {
    if (!router.isReady || hasFetchedRef.current) {
      return;
    }
    const orgInviteId =
      typeof query.orgInviteId === 'string' ? query.orgInviteId : undefined;
    const orgId = typeof query.orgId === 'string' ? query.orgId : undefined;
    const accountInviteId =
      typeof query.accountInviteId === 'string'
        ? query.accountInviteId
        : undefined;
    const inviteCode =
      typeof query.inviteCode === 'string' ? query.inviteCode : undefined;

    const inviterAccountListId = router.query.accountListId || undefined;
    const acceptInvite = async (id: string, code: string, url: string) => {
      const inviteType = url.includes('organizations')
        ? 'organization_invites'
        : 'account_list_invites';

      try {
        const apiToken = session.apiToken;

        const response = await fetchAcceptInvite({
          apiToken,
          url,
          inviteType,
          id,
          code,
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        if (url.includes('organizations')) {
          enqueueSnackbar(t('Accepted invite successfully.'), {
            variant: 'success',
          });

          router.push(
            dashboardLink + 'settings/integrations?selectedTab=organization',
          );
        } else {
          enqueueSnackbar(t('Accepted invite successfully.'), {
            variant: 'success',
          });
          router.push(dashboardLink);
        }
      } catch (err) {
        const inviter = url.includes('organizations')
          ? t('organization admin')
          : t('account holder');
        enqueueSnackbar(
          t(
            'Unable to accept invite. Try asking the {{inviter}} to resend the invite.',
            { inviter },
          ),
          {
            variant: 'error',
          },
        );
      }
    };

    if (accountInviteId && inviteCode && inviterAccountListId) {
      const url = `account_lists/${inviterAccountListId}/invites/${accountInviteId}/accept`;
      acceptInvite(accountInviteId, inviteCode, url);
      hasFetchedRef.current = true;
    } else if (orgInviteId && inviteCode && orgId) {
      const url = `organizations/${orgId}/invites/${orgInviteId}/accept`;
      acceptInvite(orgInviteId, inviteCode, url);
      hasFetchedRef.current = true;
    } else {
      enqueueSnackbar(
        t(
          'Invalid invite URL. Try asking the the inviter to resend the invite.',
        ),
        {
          variant: 'error',
        },
      );
      router.push(dashboardLink);
    }
  }, [router.query]);

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Accept Invite')}`}</title>
      </Head>
      <SetupPage title={t('Accepting Invite')}>
        <p>{t('You will be redirected soon...')}</p>
      </SetupPage>
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default AcceptInvitePage;
