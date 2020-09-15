import React, { ReactElement, useEffect } from 'react';
import { Box } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import { useApp } from '../../App';
import { GetWeeklyActivityQueryLoadingMocks } from './WeeklyActivity/WeeklyActivity.mock';
import { GetThisWeekEmptyMocks, GetThisWeekDefaultMocks } from './ThisWeek.mock';
import ThisWeek from '.';

export default {
    title: 'Dashboard/ThisWeek',
    decorators: [
        (StoryFn): ReactElement => {
            const { dispatch } = useApp();
            useEffect(() => {
                dispatch({ type: 'updateAccountListId', accountListId: 'abc' });
            }, []);
            return (
                <Box m={2}>
                    <StoryFn />
                </Box>
            );
        },
    ],
};

export const Default = (): ReactElement => {
    return (
        <MockedProvider mocks={GetThisWeekDefaultMocks()} addTypename={false}>
            <ThisWeek accountListId="abc" />
        </MockedProvider>
    );
};
export const Empty = (): ReactElement => {
    return (
        <MockedProvider mocks={GetThisWeekEmptyMocks()} addTypename={false}>
            <ThisWeek accountListId="abc" />
        </MockedProvider>
    );
};
export const Loading = (): ReactElement => {
    return (
        <MockedProvider mocks={GetWeeklyActivityQueryLoadingMocks()} addTypename={false}>
            <ThisWeek accountListId="abc" />
        </MockedProvider>
    );
};
