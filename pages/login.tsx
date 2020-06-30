import React, { ReactElement } from 'react';
import Head from 'next/head';
import { Button } from '@material-ui/core';
import useUser from '../src/lib/useUser';

const IndexPage = (): ReactElement => {
    useUser({ redirectTo: '/', redirectIfFound: true });

    return (
        <>
            <Head>
                <title>MPDX | Fundraising software built for God’s people</title>
            </Head>
            <Button href={`${process.env.AUTH_URL}${process.env.AUTH_LOGIN_PATH}`} variant="contained" color="primary">
                Login
            </Button>
        </>
    );
};

export default IndexPage;
