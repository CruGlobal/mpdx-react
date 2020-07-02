import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { gql, useApolloClient } from '@apollo/client';
import { GetServerSideProps } from 'next';
import { setOptions, getSession } from 'next-auth/client';
import AccountLists from '../src/components/AccountLists';
import { ssrClient } from '../src/lib/client';
import { GetAccountListsQuery } from '../types/GetAccountListsQuery';

export const GET_ACCOUNT_LISTS_QUERY = gql`
    query GetAccountListsQuery {
        accountLists {
            nodes {
                id
                name
            }
        }
    }
`;

export const LOCAL_STATE_QUERY = gql`
    query LocalStateQuery {
        currentAccountListId
        breadcrumb
    }
`;

interface Props {
    data: GetAccountListsQuery;
}

const AccountListsPage = ({ data }: Props): ReactElement => {
    const client = useApolloClient();

    useEffect(() => {
        client.writeQuery({
            query: LOCAL_STATE_QUERY,
            data: { currentAccountListId: null, breadcrumb: 'Dashboard' },
        });
    });

    return (
        <>
            <Head>
                <title>MPDX | Account Lists</title>
            </Head>
            <AccountLists data={data} />
        </>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ res, req }): Promise<{ props: Props }> => {
    setOptions({ site: process.env.SITE_URL });
    const session = await getSession({ req });

    if (!session?.user?.token) {
        res.writeHead(302, { Location: '/' });
        res.end();
        return null;
    }

    const client = await ssrClient(session?.user?.token);
    const response = await client.query<GetAccountListsQuery>({ query: GET_ACCOUNT_LISTS_QUERY });

    return {
        props: { data: response.data },
    };
};

export default AccountListsPage;
