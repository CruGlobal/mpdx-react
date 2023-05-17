import React, { ReactElement, useEffect, useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { Button } from '@mui/material';
import SubjectIcon from '@mui/icons-material/Subject';
import { GetServerSideProps } from 'next';
import i18n from 'i18next';
import Head from 'next/head';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import useGetAppSettings from '../src/hooks/useGetAppSettings';
import Welcome from '../src/components/Welcome';
import BaseLayout from '../src/components/Layouts/Basic';
import Loading from '../src/components/Loading';

interface IndexPageProps {
  signInButtonText: string;
  signInAuthProviderId: string;
  immediateSignIn: boolean;
}

const AlertBox = styled(Alert)({
  marginTop: '20px',
  width: '100%',
  maxWidth: '450px',
});

const IndexPage = ({
  signInButtonText,
  signInAuthProviderId,
  immediateSignIn,
}: IndexPageProps): ReactElement => {
  const { appName } = useGetAppSettings();
  const [ableToConnect, setAbleToConnect] = useState(true);
  const [attemptsFailed, setAttemptsFailed] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (immediateSignIn) signIn(signInAuthProviderId);
  }, []);

  useEffect(() => {
    if (attemptsFailed > 1) {
      setAbleToConnect(false);
      return;
    }
    new Promise((resolve) => setTimeout(resolve, 500 * (attemptsFailed + 1)))
      .then(() =>
        fetch(process.env.API_URL || '', {
          method: 'POST',
        }),
      )
      .catch(() => {
        setAttemptsFailed(attemptsFailed + 1);
      });
  }, [attemptsFailed]);

  return (
    <>
      <Head>
        <title>{appName} | Home</title>
      </Head>
      {immediateSignIn && <Loading loading={true} />}
      <Welcome
        title={
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={process.env.NEXT_PUBLIC_MEDIA_LOGO}
            alt="logo"
            height={50}
          />
        }
        subtitle={`${appName} is fundraising software from Cru that helps you grow and maintain your ministry
  partners in a quick and easy way.`}
      >
        <Button
          size="large"
          variant="contained"
          onClick={() => signIn(signInAuthProviderId)}
          color="inherit"
        >
          {signInButtonText}
        </Button>
        <Button
          size="large"
          startIcon={<SubjectIcon />}
          href="https://help.mpdx.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#fff' }}
        >
          Find help
        </Button>

        {!ableToConnect ? (
          <AlertBox severity="warning">
            {t(
              'We are experiencing issues connecting to our internal API. This may interrupt your session.',
            )}
          </AlertBox>
        ) : null}
      </Welcome>
    </>
  );
};

IndexPage.layout = BaseLayout;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const authProvider = process.env.AUTH_PROVIDER;

  const signInButtonText =
    authProvider === 'OKTA'
      ? i18n.t('Sign In')
      : i18n.t(`Sign In with {{authProviderName}}`, {
          authProviderName: process.env.API_OAUTH_VISIBLE_NAME,
        });
  const signInAuthProviderId = authProvider?.toLowerCase()?.replace(/_/g, '');

  const redirectCookie = context.req.headers?.cookie
    ?.split('mpdx-handoff.redirect-url=')[1]
    ?.split(';')[0];
  const immediateSignIn = !!redirectCookie;

  if (immediateSignIn) {
    context.res.setHeader(
      'Set-Cookie',
      `mpdx-handoff.redirect-url=; HttpOnly; path=/; Max-Age=0`,
    );
  }
  if (context.res && session) {
    return {
      redirect: {
        destination: redirectCookie ?? '/accountLists',
        permanent: false,
      },
    };
  }

  return {
    props: {
      signInButtonText,
      signInAuthProviderId,
      immediateSignIn,
    },
  };
};

export default IndexPage;
