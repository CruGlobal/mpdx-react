import React, { ReactElement } from 'react';
import { signin, setOptions, getSession } from 'next-auth/client';
import { Button } from '@material-ui/core';
import SubjectIcon from '@material-ui/icons/Subject';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Welcome from '../src/components/Welcome';
import BaseLayout from '../src/components/Layouts/Basic';

const IndexPage = (): ReactElement => (
    <>
        <Head>
            <title>MPDX | Home</title>
        </Head>
        <Welcome
            title={<img src={require('../src/images/logo.svg')} alt="logo" height={50} />}
            subtitle="MPDX is fundraising software from Cru that helps you grow and maintain your ministry
partners in a quick and easy way."
        >
            <Button
                size="large"
                variant="contained"
                onClick={(): void => signin('thekey', { callbackUrl: `${process.env.SITE_URL}/accountLists` })}
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

IndexPage.layout = BaseLayout;

export const getServerSideProps: GetServerSideProps = async (context): Promise<{ props: {} }> => {
    setOptions({ site: process.env.SITE_URL });
    const session = await getSession(context);

    if (context.res && session) {
        context.res.writeHead(302, { Location: '/accountLists' });
        context.res.end();
    }

    return { props: {} };
};

export default IndexPage;
