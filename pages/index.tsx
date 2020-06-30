import React, { ReactElement } from 'react';
import Head from 'next/head';
import { gql, useApolloClient } from '@apollo/client';
import useUser from '../src/lib/useUser';
import Home from '../src/components/Home';

const IndexPage = (): ReactElement => {
    useUser({ redirectTo: '/login' });
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
        </>
    );
};

export default IndexPage;
