import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactElement, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { SetupPage } from 'src/components/Setup/SetupPage';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { loadSession } from './api/utils/pagePropsHelpers';

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
      accept: 'application/vnd.api+json',
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
  const session = useRequiredSession();
  const currentUserAccountListId = useAccountListId();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const { inviteCode, accountInviteId, orgInviteId, orgId } = router.query;
    const inviterAccountListId = router.query.accountListId || undefined;
    const acceptInvite = async (id, code, url) => {
      const inviteType = url.includes('organizations')
        ? 'organization_invites'
        : 'account_list_invites';

      try {
        const apiToken = session?.apiToken;

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
            `/accountLists/${currentUserAccountListId}/settings/preferences`,
          );
        } else {
          enqueueSnackbar(t('Accepted invite successfully.'), {
            variant: 'success',
          });
          router.push(`/accountLists/${currentUserAccountListId}`);
        }
      } catch (err) {
        enqueueSnackbar(
          t(
            'Unable to accept invite. Try asking the account holder to resend the invite.',
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
    } else if (orgInviteId && inviteCode && orgId) {
      const url = `organizations/${orgId}/invites/${orgInviteId}/accept`;
      acceptInvite(orgInviteId, inviteCode, url);
    }
  }, [router.query]);

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Accept Invite')}
        </title>
      </Head>
      <SetupPage title={t('Accepting Invite')}>
        <p>{t('You will be redirected soon')}</p>
      </SetupPage>
    </>
  );
};

export const getServerSideProps = loadSession;

export default AcceptInvitePage;
