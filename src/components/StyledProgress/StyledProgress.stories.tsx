import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import StyledProgress from '.';

export default {
    title: 'StyledProgress',
};

export const Default = (): ReactElement => {
    return (
        <Box m={2}>
            <StyledProgress primary={0.2} secondary={0.7} />
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
