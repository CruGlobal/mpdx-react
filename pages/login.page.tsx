import React, { ReactElement } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { Button } from '@mui/material';
import SubjectIcon from '@mui/icons-material/Subject';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import useGetAppSettings from '../src/hooks/useGetAppSettings';
import Welcome from '../src/components/Welcome';
import BaseLayout from '../src/components/Layouts/Basic';

const IndexPage = (): ReactElement => {
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>{appName} | Home</title>
      </Head>
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
          onClick={() => signIn('okta')}
          color="inherit"
        >
          Sign In
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

  if (context.res && session) {
    return {
      redirect: {
        destination: '/accountLists',
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default IndexPage;
