import React, { ReactElement } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Container, Grid, Box } from '@material-ui/core';
import moment from 'moment';
import { GetDashboardQuery } from '../../../types/GetDashboardQuery';
import Welcome from './Welcome';
import MonthlyGoal from './MonthlyGoal';
import Balance from './Balance';
import DonationHistories from './DonationHistories';
import ThisWeek from './ThisWeek';

interface Props {
    accountListId: string;
}

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

const Dashboard = ({ accountListId }: Props): ReactElement => {
    const { loading, data } = useQuery<GetDashboardQuery>(GET_DASHBOARD_QUERY, {
        variables: {
            accountListId: accountListId,
            endOfDay: moment().endOf('day').toISOString(),
            today: moment().endOf('day').toISOString().slice(0, 10),
            twoWeeksFromNow: moment().endOf('day').add(2, 'weeks').toISOString().slice(0, 10),
        },
    });

    return (
        <>
            <Welcome firstName={data?.user?.firstName} />
            <Box py={{ xs: 2, sm: 5 }}>
                <Container>
                    <Grid container spacing={3} alignItems="stretch">
                        <Grid xs={12} sm={8} item>
                            <MonthlyGoal
                                loading={loading}
                                goal={data?.accountList?.monthlyGoal}
                                received={data?.accountList?.receivedPledges || 0}
                                pledged={data?.accountList?.committed || 0}
                                currencyCode={data?.accountList?.currency || 'USD'}
                            />
                        </Grid>
                        <Grid xs={12} sm={4} item>
                            <Balance
                                loading={loading}
                                balance={data?.accountList?.balance}
                                currencyCode={data?.accountList?.currency || 'USD'}
                            />
                        </Grid>
                        <Grid xs={12} item>
                            <DonationHistories
                                loading={loading}
                                goal={data?.accountList?.monthlyGoal}
                                pledged={data?.accountList?.committed}
                                reportsDonationHistories={data?.reportsDonationHistories}
                                currencyCode={data?.accountList?.currency || 'USD'}
                            />
                        </Grid>
                        <Grid xs={12} item>
                            <ThisWeek
                                loading={loading}
                                dueTasks={data?.dueTasks}
                                prayerRequestTasks={data?.prayerRequestTasks}
                                latePledgeContacts={data?.latePledgeContacts}
                                peopleWithBirthdays={data?.reportsPeopleWithBirthdays?.periods[0]?.people}
                                peopleWithAnniversaries={data?.reportsPeopleWithAnniversaries?.periods[0]?.people}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default Dashboard;
