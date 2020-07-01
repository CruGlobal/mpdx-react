import React, { ReactElement } from 'react';
import Head from 'next/head';
import { gql, useApolloClient } from '@apollo/client';
import Link from 'next/link';
import { Button } from '@material-ui/core';
import Home from '../src/components/Home';

const AccountListsPage = (): ReactElement => {
    const client = useApolloClient();

    client.writeQuery({
        query: gql`
            query {
                currentAccountListId
                breadcrumb
            }
        `,
        data: { currentAccountListId: null, breadcrumb: 'Dashboard' },
    });

    return (
        <>
            <Head>
                <title>MPDX | Fundraising software built for God’s people</title>
            </Head>
            <Home />
            <Link href="/test">
                <Button>Go to test</Button>
            </Link>
        </>
    );
};

export default AccountListsPage;
