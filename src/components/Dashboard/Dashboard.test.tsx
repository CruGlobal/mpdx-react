import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { GetDashboardQuery } from '../../../types/GetDashboardQuery';
import matchMediaMock from '../../../tests/matchMediaMock';
import { AppProviderContext } from '../App/Provider';
import { GetThisWeekDefaultMocks } from './ThisWeek/ThisWeek.mock';
import Dashboard from '.';

jest.mock('../App', () => ({
    useApp: (): Partial<AppProviderContext> => ({
        openTaskDrawer: jest.fn(),
    }),
}));

const data: GetDashboardQuery = {
    user: {
        firstName: 'Roger',
    },
    accountList: {
        name: 'My Account List',
        monthlyGoal: 1000,
        receivedPledges: 400,
        totalPledges: 700,
        currency: 'NZD',
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

describe(Dashboard.name, () => {
    beforeEach(() => {
        matchMediaMock({ width: '1024px' });
    });

    it('default', async () => {
        const { getByTestId, queryByTestId } = render(
            <MockedProvider mocks={GetThisWeekDefaultMocks()} addTypename={false}>
                <Dashboard accountListId="abc" data={data} />
            </MockedProvider>,
        );
        await waitFor(() => expect(queryByTestId('PartnerCarePrayerListLoading')).not.toBeInTheDocument());
        expect(getByTestId('MonthlyGoalTypographyGoal').textContent).toEqual('NZ$1,000');
        expect(getByTestId('MonthlyGoalTypographyPledged').textContent).toEqual('NZ$700');
        expect(getByTestId('MonthlyGoalTypographyReceived').textContent).toEqual('NZ$400');
        expect(getByTestId('BalanceTypography').textContent).toEqual('NZ$1,000');
        expect(getByTestId('DonationHistoriesTypographyGoal').textContent).toEqual('Goal NZ$1,000');
        expect(getByTestId('DonationHistoriesTypographyAverage').textContent).toEqual('Average NZ$750');
        expect(getByTestId('DonationHistoriesTypographyPledged').textContent).toEqual('Committed NZ$700');
        expect(getByTestId('PartnerCarePrayerList')).toBeInTheDocument();
        expect(getByTestId('TasksDueThisWeekList')).toBeInTheDocument();
        expect(getByTestId('LateCommitmentsListContacts')).toBeInTheDocument();
        expect(getByTestId('ReferralsTabRecentList')).toBeInTheDocument();
        expect(getByTestId('AppealsBoxName')).toBeInTheDocument();
    });

    it('handles null fields', async () => {
        const { getByTestId, queryByTestId } = render(
            <MockedProvider mocks={GetThisWeekDefaultMocks()} addTypename={false}>
                <Dashboard
                    accountListId="abc"
                    data={{ ...data, accountList: { ...data.accountList, monthlyGoal: null, currency: null } }}
                />
            </MockedProvider>,
        );
        await waitFor(() => expect(queryByTestId('PartnerCarePrayerListLoading')).not.toBeInTheDocument());
        expect(getByTestId('MonthlyGoalTypographyGoal').textContent).toEqual('$0');
        expect(getByTestId('MonthlyGoalTypographyPledged').textContent).toEqual('$700');
        expect(getByTestId('MonthlyGoalTypographyReceived').textContent).toEqual('$400');
        expect(getByTestId('BalanceTypography').textContent).toEqual('$1,000');
        expect(queryByTestId('DonationHistoriesTypographyGoal')).not.toBeInTheDocument();
        expect(getByTestId('DonationHistoriesTypographyAverage').textContent).toEqual('Average $750');
        expect(getByTestId('DonationHistoriesTypographyPledged').textContent).toEqual('Committed $700');
    });
});
