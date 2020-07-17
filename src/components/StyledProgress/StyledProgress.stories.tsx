import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { number, boolean } from '@storybook/addon-knobs';
import StyledProgress from '.';

export default {
    title: 'StyledProgress',
};

export const Default = (): ReactElement => {
    const options = {
        range: true,
        min: 0,
        max: 100,
        step: 1,
    };

    return (
        <Box m={2}>
            <StyledProgress
                primary={number('primary', 50, options) / 100}
                secondary={number('secondary', 75, options) / 100}
                loading={boolean('loading', false)}
            />
        </Box>
    );
};

export const WhenMin = (): ReactElement => {
    return (
        <Box m={2}>
            <StyledProgress primary={0} secondary={0} />
        </Box>
    );
};
export const WhenMax = (): ReactElement => {
    return (
        <Box m={2}>
            <StyledProgress primary={0.5} secondary={1} />
        </Box>
    );
};
export const Loading = (): ReactElement => {
    return (
        <Box m={2}>
            <StyledProgress loading />
        </Box>
    );
};
export const Empty = (): ReactElement => {
    return (
        <Box m={2}>
            <StyledProgress />
        </Box>
    );
};
