import React, { ReactElement } from 'react';
import { useQuery, gql } from '@apollo/client';
import { GetAccountListsQuery } from '../../../types/GetAccountListsQuery';
import Loading from '../Loading';
import Welcome from './Welcome';
import AccountLists from './AccountLists';

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

const Home = (): ReactElement => {
    const { loading, data } = useQuery<GetAccountListsQuery>(GET_ACCOUNT_LISTS_QUERY);

    if (loading) {
        return <Loading />;
    }

    if (data?.accountLists?.nodes) {
        return <AccountLists items={data.accountLists.nodes} />;
    } else {
        return <Welcome />;
    }
};

export default Home;
