import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { useApolloClient, gql } from '@apollo/client';
import { GetServerSideProps } from 'next';
import moment from 'moment';
import { getSession } from 'next-auth/client';
import Dashboard from '../../src/components/Dashboard';
import { GetDashboardQuery } from '../../types/GetDashboardQuery';
import { ssrClient } from '../../src/lib/client';

export const GET_DASHBOARD_QUERY = gql`
    query GetDashboardQuery(
        $accountListId: ID!
        $endOfDay: ISO8601DateTime!
        $today: ISO8601Date!
        $twoWeeksFromNow: ISO8601Date!
    ) {
        user {
            firstName
        }
        accountList(id: $accountListId) {
            monthlyGoal
            receivedPledges
            committed
            currency
            balance
        }
        reportsDonationHistories(accountListId: $accountListId) {
            averageIgnoreCurrent
            periods {
                startDate
                convertedTotal
                totals {
                    currency
                    convertedAmount
                }
            }
        }
        dueTasks: tasks(accountListId: $accountListId, first: 3, startAt: { max: $endOfDay }) {
            nodes {
                id
                subject
                activityType
                contacts {
                    nodes {
                        name
                    }
                }
            }
            totalCount
        }
        prayerRequestTasks: tasks(accountListId: $accountListId, first: 3, activityType: PRAYER_REQUEST) {
            nodes {
                id
                subject
                activityType
                contacts {
                    nodes {
                        name
                    }
                }
            }
            totalCount
        }
        latePledgeContacts: contacts(accountListId: $accountListId, first: 3, lateAt: { max: $today }) {
            nodes {
                id
                name
                lateAt
            }
            totalCount
        }
        reportsPeopleWithBirthdays(accountListId: $accountListId, range: "1m", endDate: $twoWeeksFromNow) {
            periods {
                people {
                    id
                    birthdayDay
                    birthdayMonth
                    firstName
                    lastName
                    parentContact {
                        id
                    }
                }
            }
        }
        reportsPeopleWithAnniversaries(accountListId: $accountListId, range: "1m", endDate: $twoWeeksFromNow) {
            periods {
                people {
                    id
                    anniversaryDay
                    anniversaryMonth
                    parentContact {
                        id
                        name
                    }
                }
            }
        }
    }
`;

interface Props {
    data: GetDashboardQuery;
    accountListId: string;
}

const AccountListIdPage = ({ data, accountListId }: Props): ReactElement => {
    const client = useApolloClient();

    useEffect(() => {
        client.writeQuery({
            query: gql`
                query {
                    currentAccountListId
                    breadcrumb
                }
            `,
            data: { currentAccountListId: accountListId, breadcrumb: 'Dashboard' },
        });
    }, []);

    return (
        <>
            <Head>
                <title>MPDX | Fundraising software built for God’s people</title>
            </Head>
            <Dashboard data={data} />
        </>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
    req,
    res,
}): Promise<{ props: Props }> => {
    const session = await getSession({ req });
    const client = await ssrClient(session?.user?.token);

    if (!session?.user?.token) {
        res.writeHead(302, { Location: '/' });
        res.end();
        return null;
    }

    const response = await client.query<GetDashboardQuery>({
        query: GET_DASHBOARD_QUERY,
        variables: {
            accountListId: params.accountListId,
            endOfDay: moment().endOf('day').toISOString(),
            today: moment().endOf('day').toISOString().slice(0, 10),
            twoWeeksFromNow: moment().endOf('day').add(2, 'weeks').toISOString().slice(0, 10),
        },
    });

    return {
        props: { data: response.data, accountListId: params.accountListId.toString() },
    };
};

export default AccountListIdPage;
