import React, { ReactElement, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { Button } from '@mui/material';
import SubjectIcon from '@mui/icons-material/Subject';
import { GetServerSideProps } from 'next';
import i18n from 'i18next';
import Head from 'next/head';
import useGetAppSettings from '../src/hooks/useGetAppSettings';
import Welcome from '../src/components/Welcome';
import BaseLayout from '../src/components/Layouts/Basic';
import Loading from '../src/components/Loading';

interface IndexPageProps {
  signInButtonText: string;
  signInAuthProviderId: string;
  immediateSignIn: boolean;
}

const IndexPage = ({
  signInButtonText,
  signInAuthProviderId,
  immediateSignIn,
}: IndexPageProps): ReactElement => {
  const { appName } = useGetAppSettings();

  useEffect(() => {
    if (immediateSignIn) signIn(signInAuthProviderId);
  }, []);

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
      `mpdx-handoff.redirect-url=; HttpOnly; path=/; Expires=${new Date().toUTCString()}`,
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
