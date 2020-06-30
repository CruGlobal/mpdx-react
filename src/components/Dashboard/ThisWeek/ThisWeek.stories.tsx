import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import ThisWeek from '.';

export default {
    title: 'Dashboard/ThisWeek',
};

export const Default = (): ReactElement => {
    return (
        <Box m={2}>
            <ThisWeek />
        </Box>
    );
};
export const Empty = (): ReactElement => {
    return (
        <Box m={2}>
            <ThisWeek />
        </Box>
    );
};
export const Loading = (): ReactElement => {
    return (
        <Box m={2}>
            <ThisWeek loading />
        </Box>
    );
};
