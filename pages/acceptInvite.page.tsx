import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactElement, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { SetupPage } from 'src/components/Setup/SetupPage';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { loadSession } from './api/utils/pagePropsHelpers';

const AcceptInvitePage = (): ReactElement => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const { accountListId, inviteCode, accountInviteId, orgInviteId, orgId } =
      router.query;
    const acceptInvite = async (id, code, url) => {
      const inviteType = url.includes('organizations')
        ? 'organization_invites'
        : 'account_list_invites';

      try {
        const session = await getSession();
        const apiToken = session?.user?.apiToken;

        const response = await fetch(process.env.REST_API_URL + url, {
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

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        if (url.includes('organizations')) {
          enqueueSnackbar(t('Accepted invite successfully.'), {
            variant: 'success',
          });
          router.push(`/accountLists/${accountListId}/settings/preferences`);
        } else {
          enqueueSnackbar(t('Accepted invite successfully.'), {
            variant: 'success',
          });
          router.push(`/accountLists/${accountListId}/`);
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

    if (accountInviteId && inviteCode && accountListId) {
      const url = `account_lists/${accountListId}/invites/${accountInviteId}/accept`;
      acceptInvite(accountInviteId, inviteCode, url);
    } else if (orgInviteId && inviteCode && orgId && accountListId) {
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
