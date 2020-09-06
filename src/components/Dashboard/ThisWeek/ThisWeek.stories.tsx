import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import cacheMock from '../../../../tests/cacheMock';
import { AppProvider } from '../../App';
import { GetWeeklyActivityQueryLoadingMocks } from './WeeklyActivity/WeeklyActivity.mock';
import { GetThisWeekEmptyMocks, GetThisWeekDefaultMocks } from './ThisWeek.mock';
import ThisWeek from '.';

export default {
    title: 'Dashboard/ThisWeek',
};

export const Default = (): ReactElement => {
    return (
        <MockedProvider mocks={GetThisWeekDefaultMocks()} cache={cacheMock()} addTypename={false}>
            <AppProvider>
                <Box m={2}>
                    <ThisWeek accountListId="abc" />
                </Box>
            </AppProvider>
        </MockedProvider>
    );
};
export const Empty = (): ReactElement => {
    return (
        <MockedProvider mocks={GetThisWeekEmptyMocks()} cache={cacheMock()} addTypename={false}>
            <AppProvider>
                <Box m={2}>
                    <ThisWeek accountListId="abc" />
                </Box>
            </AppProvider>
        </MockedProvider>
    );
};
export const Loading = (): ReactElement => {
    return (
        <MockedProvider mocks={GetWeeklyActivityQueryLoadingMocks()} cache={cacheMock()} addTypename={false}>
            <AppProvider>
                <Box m={2}>
                    <ThisWeek accountListId="abc" />
                </Box>
            </AppProvider>
        </MockedProvider>
    );
};
