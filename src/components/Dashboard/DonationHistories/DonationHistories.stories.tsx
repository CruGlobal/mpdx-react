import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import DonationHistories from '.';

export default {
    title: 'Dashboard/DonationHistories',
};

const reportsDonationHistories = {
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
};

export const Default = (): ReactElement => {
    return (
        <Box m={2}>
            <DonationHistories reportsDonationHistories={reportsDonationHistories} currencyCode="GBP" />
        </Box>
    );
};

export const WithReferences = (): ReactElement => {
    return (
        <Box m={2}>
            <DonationHistories
                reportsDonationHistories={reportsDonationHistories}
                goal={1000}
                pledged={500}
                currencyCode="GBP"
            />
        </Box>
    );
};

export const Loading = (): ReactElement => {
    return (
        <Box m={2}>
            <DonationHistories loading />
        </Box>
    );
};

export const Empty = (): ReactElement => {
    const emptyReportsDonationHistories = {
        periods: [
            {
                convertedTotal: 0,
                startDate: '2011-12-1',
                totals: [],
            },
            {
                convertedTotal: 0,
                startDate: '2012-1-1',
                totals: [],
            },
            {
                convertedTotal: 0,
                startDate: '2012-2-1',
                totals: [],
            },
            {
                convertedTotal: 0,
                startDate: '2012-3-1',
                totals: [],
            },
        ],
        averageIgnoreCurrent: 0,
    };

    return (
        <Box m={2}>
            <DonationHistories reportsDonationHistories={emptyReportsDonationHistories} />
        </Box>
    );
};
