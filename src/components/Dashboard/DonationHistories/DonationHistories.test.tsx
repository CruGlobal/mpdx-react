import React from 'react';
import { render } from '@testing-library/react';
import DonationHistories from '.';

describe(DonationHistories.name, () => {
    let reportsDonationHistories;

    it('default', () => {
        const { getByTestId, queryByTestId } = render(<DonationHistories />);
        expect(getByTestId('DonationHistoriesBoxEmpty')).toBeInTheDocument();
        expect(queryByTestId('DonationHistoriesGridLoading')).not.toBeInTheDocument();
    });

    it('empty periods', () => {
        reportsDonationHistories = {
            periods: [
                {
                    convertedTotal: 0,
                    startDate: '1-1-2019',
                    totals: [{ currency: 'USD', convertedAmount: 0 }],
                },
                {
                    convertedTotal: 0,
                    startDate: '1-2-2019',
                    totals: [{ currency: 'NZD', convertedAmount: 0 }],
                },
            ],
            averageIgnoreCurrent: 0,
        };
        const { getByTestId, queryByTestId } = render(
            <DonationHistories reportsDonationHistories={reportsDonationHistories} />,
        );
        expect(getByTestId('DonationHistoriesBoxEmpty')).toBeInTheDocument();
        expect(queryByTestId('DonationHistoriesGridLoading')).not.toBeInTheDocument();
    });

    it('loading', () => {
        const { getByTestId, queryByTestId } = render(<DonationHistories loading={true} />);
        expect(getByTestId('DonationHistoriesGridLoading')).toBeInTheDocument();
        expect(queryByTestId('DonationHistoriesBoxEmpty')).not.toBeInTheDocument();
    });

    describe('populated periods', () => {
        beforeEach(() => {
            reportsDonationHistories = {
                periods: [
                    {
                        convertedTotal: 50,
                        startDate: '1-1-2019',
                        totals: [{ currency: 'USD', convertedAmount: 50 }],
                    },
                    {
                        convertedTotal: 60,
                        startDate: '1-2-2019',
                        totals: [{ currency: 'NZD', convertedAmount: 60 }],
                    },
                ],
                averageIgnoreCurrent: 1000,
            };
        });

        it('shows references', () => {
            const { getByTestId } = render(
                <DonationHistories reportsDonationHistories={reportsDonationHistories} goal={100} pledged={2500} />,
            );
            expect(getByTestId('DonationHistoriesTypographyGoal').textContent).toEqual('Goal $100');
            expect(getByTestId('DonationHistoriesTypographyAverage').textContent).toEqual('Average $1,000');
            expect(getByTestId('DonationHistoriesTypographyPledged').textContent).toEqual('Committed $2,500');
        });
    });
});
