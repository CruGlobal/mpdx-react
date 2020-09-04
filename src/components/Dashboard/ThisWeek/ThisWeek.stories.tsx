import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import { DrawerProvider } from '../../Drawer';
import cacheMock from '../../../../tests/cacheMock';
import { GetWeeklyActivityQueryLoadingMocks } from './WeeklyActivity/WeeklyActivity.mock';
import { GetThisWeekEmptyMocks, GetThisWeekDefaultMocks } from './ThisWeek.mock';
import ThisWeek from '.';

export default {
    title: 'Dashboard/ThisWeek',
};

export const Default = (): ReactElement => {
    return (
        <MockedProvider mocks={GetThisWeekDefaultMocks()} cache={cacheMock()} addTypename={false}>
            <DrawerProvider>
                <Box m={2}>
                    <ThisWeek accountListId="abc" />
                </Box>
            </DrawerProvider>
        </MockedProvider>
    );
};
export const Empty = (): ReactElement => {
    return (
        <MockedProvider mocks={GetThisWeekEmptyMocks()} cache={cacheMock()} addTypename={false}>
            <DrawerProvider>
                <Box m={2}>
                    <ThisWeek accountListId="abc" />
                </Box>
            </DrawerProvider>
        </MockedProvider>
    );
};
export const Loading = (): ReactElement => {
    return (
        <MockedProvider mocks={GetWeeklyActivityQueryLoadingMocks()} cache={cacheMock()} addTypename={false}>
            <DrawerProvider>
                <Box m={2}>
                    <ThisWeek accountListId="abc" />
                </Box>
            </DrawerProvider>
        </MockedProvider>
    );
};
