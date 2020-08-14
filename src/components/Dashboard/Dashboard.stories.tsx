import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { GetDashboardQuery } from '../../../types/GetDashboardQuery';
import { GetThisWeekDefaultMocks } from './ThisWeek/ThisWeek.mock';
import Dashboard from '.';

export default {
    title: 'Dashboard',
};

export const Default = (): ReactElement => {
    const data: GetDashboardQuery = {
        user: {
            firstName: 'Roger',
        },
        accountList: {
            name: 'My Account List',
            monthlyGoal: 1000,
            receivedPledges: 400,
            totalPledges: 700,
            currency: 'USD',
            balance: 1000,
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
    };
    return (
        <MockedProvider mocks={GetThisWeekDefaultMocks()}>
            <Dashboard accountListId="abc" data={data} />
        </MockedProvider>
    );
};

Default.story = {
    parameters: {
        chromatic: { delay: 1000 },
    },
};
