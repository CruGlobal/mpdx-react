import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { gql, useApolloClient } from '@apollo/client';
import useUser from '../../src/lib/useUser';
import Dashboard from '../../src/components/Dashboard';
import Loading from '../../src/components/Loading';

const AccountListIdPage = (): ReactElement => {
    useUser({ redirectTo: '/login' });
    const router = useRouter();
    const client = useApolloClient();

    useEffect(
        () =>
            client.writeQuery({
                query: gql`
                    query {
                        currentAccountListId
                        breadcrumb
                    }
                `,
                data: { currentAccountListId: router.query.accountListId, breadcrumb: 'Dashboard' },
            }),
        [router.query.accountListId],
    );

    return (
        <>
            <Head>
                <title>MPDX | Fundraising software built for God’s people</title>
            </Head>
            {router.query.accountListId ? (
                <Dashboard accountListId={router.query.accountListId?.toString()} />
            ) : (
                <Loading />
            )}
        </>
    );
};

export default AccountListIdPage;
