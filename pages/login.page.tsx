import React, { ReactElement } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { Button } from '@mui/material';
import SubjectIcon from '@mui/icons-material/Subject';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Welcome from '../src/components/Welcome';
import BaseLayout from '../src/components/Layouts/Basic';

interface iProps {
  useOktaOauth?: boolean;
  useApiOauth?: boolean;
  apiOauthVisibleName?: string;
}

const IndexPage = ({
  useOktaOauth,
  useApiOauth,
  apiOauthVisibleName,
}: iProps): ReactElement => (
  <>
    <Head>
      <title>MPDX | Home</title>
    </Head>
    <Welcome
      title={
        <img src={process.env.NEXT_PUBLIC_MEDIA_LOGO} alt="logo" height={50} />
      }
      subtitle="MPDX is fundraising software from Cru that helps you grow and maintain your ministry
partners in a quick and easy way."
    >
      {useOktaOauth && (
        <Button
          size="large"
          variant="contained"
          onClick={() => signIn('okta')}
          color="inherit"
        >
          Sign In
        </Button>
      )}

      {useApiOauth && (
        <Button
          size="large"
          variant="contained"
          onClick={() => signIn('apioauth')}
          color="inherit"
          style={{ marginLeft: useOktaOauth ? '10px' : '' }}
        >
          Sign In with {apiOauthVisibleName}
        </Button>
      )}

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

IndexPage.layout = BaseLayout;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  const useOktaOauth = process.env.USE_OKTA_OAUTH === 'true';
  const useApiOauth = process.env.USE_API_OAUTH === 'true';
  const apiOauthVisibleName = process.env.API_OAUTH_VISIBLE_NAME;

  if (context.res && session) {
    return {
      redirect: {
        destination: '/accountLists',
        permanent: false,
      },
    };
  }

  return {
    props: {
      useOktaOauth,
      useApiOauth,
      apiOauthVisibleName,
    },
  };
};

export default IndexPage;
