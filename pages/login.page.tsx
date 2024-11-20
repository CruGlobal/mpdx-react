import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { ReactElement, useEffect } from 'react';
import SubjectIcon from '@mui/icons-material/Subject';
import { Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getSession, signIn } from 'next-auth/react';
import BaseLayout from 'src/components/Layouts/Basic';
import Loading from 'src/components/Loading';
import Welcome from 'src/components/Welcome';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { extractCookie } from 'src/lib/extractCookie';
import i18n from 'src/lib/i18n';
import { getQueryParam } from 'src/utils/queryParam';

const SignUpBox = styled('div')(({ theme }) => ({
  marginBlock: theme.spacing(2),
}));

export interface LoginProps {
  signInButtonText: string;
  signInAuthProviderId: string;
  immediateSignIn: boolean;
  isOkta: boolean;
}

const Login = ({
  signInButtonText,
  signInAuthProviderId,
  immediateSignIn,
  isOkta,
}: LoginProps): ReactElement => {
  const { appName } = useGetAppSettings();

  useEffect(() => {
    if (immediateSignIn) {
      signIn(signInAuthProviderId);
    }
  }, []);

  const helpUrl =
    process.env.HELPJUICE_KNOWLEDGE_BASE_URL || process.env.HELPJUICE_ORIGIN;

  return (
    <>
      <Head>
        <title>{`${appName} | Home`}</title>
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
          id="sign-in-button"
          size="large"
          variant="contained"
          onClick={() => signIn(signInAuthProviderId)}
          color="inherit"
        >
          {signInButtonText}
        </Button>
        {helpUrl && (
          <Button
            size="large"
            startIcon={<SubjectIcon />}
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#fff' }}
          >
            Find help
          </Button>
        )}
        {isOkta && (
          <SignUpBox>
            <Typography>
              Don&apos;t have an Okta account?
              <br />
              Click the <strong>Sign in</strong> button above, then{' '}
              <strong>Sign up</strong>.
            </Typography>
          </SignUpBox>
        )}
      </Welcome>
    </>
  );
};

Login.layout = BaseLayout;

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

  const redirectCookie = extractCookie(
    context.req.headers?.cookie,
    'mpdx-handoff.redirect-url',
  );
  const impersonateCookie = !!extractCookie(
    context.req.headers?.cookie,
    'mpdx-handoff.impersonate',
  );
  const immediateSignIn = !!redirectCookie;

  if (immediateSignIn && !impersonateCookie) {
    context.res.setHeader(
      'Set-Cookie',
      `mpdx-handoff.redirect-url=; HttpOnly; path=/; Max-Age=0`,
    );
  }
  if (session && !impersonateCookie) {
    const queryRedirectUrl = getQueryParam(context.query, 'redirect');
    return {
      redirect: {
        destination: redirectCookie ?? queryRedirectUrl ?? '/accountLists',
        permanent: false,
      },
    };
  }

  return {
    props: {
      signInButtonText,
      signInAuthProviderId,
      immediateSignIn,
      isOkta: authProvider === 'OKTA',
    },
  };
};

export default Login;
