import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { gql } from '@apollo/client';
import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import { getSession } from 'next-auth/client';
import { useTranslation } from 'react-i18next';
import AccountLists from '../src/components/AccountLists';
import { ssrClient } from '../src/lib/client';
import { GetAccountListsQuery } from '../types/GetAccountListsQuery';
import BaseLayout from '../src/components/Layouts/Basic';
import { useApp } from '../src/components/App';

export const GET_ACCOUNT_LISTS_QUERY = gql`
    query GetAccountListsQuery {
        accountLists {
            nodes {
                id
                name
                monthlyGoal
                receivedPledges
                totalPledges
                currency
            }
        }
    }
`;

interface Props {
    data: GetAccountListsQuery;
}

const AccountListsPage = ({ data }: Props): ReactElement => {
    const { dispatch } = useApp();
    const { t } = useTranslation();

    useEffect(() => {
        dispatch({ type: 'updateBreadcrumb', breadcrumb: t('Dashboard') });
    }, []);

    return (
        <>
            <Head>
                <title>MPDX | {t('Account Lists')}</title>
            </Head>
            <AccountLists data={data} />
        </>
    );
};

AccountListsPage.layout = BaseLayout;

export const getServerSideProps: GetServerSideProps = async ({
    res,
    req,
}): Promise<GetServerSidePropsResult<Props | unknown>> => {
    const session = await getSession({ req });

    if (!session?.user['token']) {
        res.writeHead(302, { Location: '/' });
        res.end();
        return { props: {} };
    }

    const client = await ssrClient(session?.user['token']);
    const response = await client.query<GetAccountListsQuery>({ query: GET_ACCOUNT_LISTS_QUERY });

    if (response.data.accountLists.nodes && response.data.accountLists.nodes.length == 1) {
        res.writeHead(302, { Location: `/accountLists/${response.data.accountLists.nodes[0].id}` });
        res.end();
        return { props: {} };
    }

    return {
        props: { data: response.data },
    };
};

export default AccountListsPage;
