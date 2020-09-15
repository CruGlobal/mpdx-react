import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import withDispatch from '../../../decorators/withDispatch';
import { GetWeeklyActivityQueryLoadingMocks } from './WeeklyActivity/WeeklyActivity.mock';
import { GetThisWeekEmptyMocks, GetThisWeekDefaultMocks } from './ThisWeek.mock';
import ThisWeek from '.';

export default {
    title: 'Dashboard/ThisWeek',
    decorators: [
        withDispatch({ type: 'updateAccountListId', accountListId: 'abc' }),
        (StoryFn): ReactElement => (
            <Box m={2}>
                <StoryFn />
            </Box>
        ),
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
