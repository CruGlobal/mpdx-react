import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import moment from 'moment';
import { GET_DASHBOARD_QUERY } from './Dashboard';
import Dashboard from '.';

export default {
    title: 'Dashboard',
};

export const Default = (): ReactElement => {
    const mocks = [
        {
            request: {
                query: GET_DASHBOARD_QUERY,
                variables: {
                    accountListId: 'abc',
                    endOfDay: moment().endOf('day').toISOString(),
                    today: moment().endOf('day').toISOString(),
                },
            },
            result: {
                data: {
                    user: {
                        firstName: 'Roger',
                    },
                    accountList: {
                        monthlyGoal: 1000,
                        receivedPledges: 400,
                        committed: 700,
                        currency: 'USD',
                    },
                    reportsDonationHistories: {
                        periods: [
                            {
                                convertedTotal: 200,
                                startDate: '2011-12-1',
                                totals: [
                                    {
                                        currency: 'USD',
                                        convertedAmount: 350,
                                    },
                                ],
                            },
                            {
                                convertedTotal: 400,
                                startDate: '2012-1-1',
                                totals: [
                                    {
                                        currency: 'USD',
                                        convertedAmount: 750,
                                    },
                                ],
                            },
                            {
                                convertedTotal: 900,
                                startDate: '2012-2-1',
                                totals: [
                                    {
                                        currency: 'USD',
                                        convertedAmount: 550,
                                    },
                                    {
                                        currency: 'NZD',
                                        convertedAmount: 400,
                                    },
                                    {
                                        currency: 'CAD',
                                        convertedAmount: 200,
                                    },
                                    {
                                        currency: 'AUD',
                                        convertedAmount: 100,
                                    },
                                ],
                            },
                            {
                                convertedTotal: 1100,
                                startDate: '2012-3-1',
                                totals: [
                                    {
                                        currency: 'USD',
                                        convertedAmount: 950,
                                    },
                                    {
                                        currency: 'NZD',
                                        convertedAmount: 800,
                                    },
                                    {
                                        currency: 'CAD',
                                        convertedAmount: 300,
                                    },
                                    {
                                        currency: 'AUD',
                                        convertedAmount: 200,
                                    },
                                    {
                                        currency: 'HKD',
                                        convertedAmount: 100,
                                    },
                                ],
                            },
                        ],
                        averageIgnoreCurrent: 750,
                    },
                    dueTasks: {
                        nodes: [],
                        totalCount: 0,
                    },
                    prayerRequestTasks: {
                        nodes: [],
                        totalCount: 0,
                    },
                    contacts: {
                        nodes: [],
                        totalCount: 0,
                    },
                },
            },
        },
    ];
    return (
        <MockedProvider mocks={mocks} addTypename={false}>
            <Dashboard accountListId="abc" />
        </MockedProvider>
    );
};
