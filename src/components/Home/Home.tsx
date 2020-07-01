import React, { ReactElement } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Button } from '@material-ui/core';
import SubjectIcon from '@material-ui/icons/Subject';
import { GetAccountListsQuery } from '../../../types/GetAccountListsQuery';
import Loading from '../Loading';
import Welcome from '../Welcome';
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
        return (
            <Welcome
                title="Welcome to MPDX"
                subtitle="MPDX is fundraising software from Cru that helps you grow and maintain your ministry
    partners in a quick and easy way."
            >
                <Button size="large" variant="contained">
                    Get Started
                </Button>
                <Button
                    size="large"
                    startIcon={<SubjectIcon />}
                    href="https://help.mpdx.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Find help
                </Button>
            </Welcome>
        );
    }
};

export default Home;
