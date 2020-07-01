import React, { ReactElement } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@material-ui/core';

const TestPage = (): ReactElement => {
    return (
        <>
            <Head>
                <title>MPDX | Fundraising software built for God’s people</title>
            </Head>
            <Link href="/accountLists">
                <Button>Go to Account List</Button>
            </Link>
        </>
    );
};

export default TestPage;
