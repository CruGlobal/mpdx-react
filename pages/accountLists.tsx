import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { gql, useApolloClient } from '@apollo/client';
import { GetServerSideProps } from 'next';
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

interface Props {
    data: GetAccountListsQuery;
}

const AccountListsPage = ({ data }: Props): ReactElement => {
    const client = useApolloClient();

    useEffect(() => {
        client.writeQuery({
            query: gql`
                query {
                    currentAccountListId
                    breadcrumb
                }
            `,
            data: { currentAccountListId: null, breadcrumb: 'Dashboard' },
        });
    }, []);

    return (
        <>
            <Head>
                <title>MPDX | Account Lists</title>
            </Head>
            <AccountLists data={data} />
        </>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }): Promise<{ props: Props }> => {
    const client = await ssrClient(req);

    try {
        const response = await client.query<GetAccountListsQuery>({ query: GET_ACCOUNT_LISTS_QUERY });

        return {
            props: { data: response.data },
        };
    } catch (err) {
        res.writeHead(302, { Location: '/' });
        res.end();
        return null;
    }
};

export default AccountListsPage;
