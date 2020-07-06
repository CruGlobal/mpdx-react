import React, { ReactElement, ReactNode } from 'react';
import { Box, makeStyles, Theme } from '@material-ui/core';
import TopBar from './Nav';

const useStyles = makeStyles((theme: Theme) => ({
    box: {
        backgroundColor: '#f6f7f9',
        minHeight: 'calc(100vh - 122px)',
        [theme.breakpoints.down('xs')]: {
            minHeight: '100vh',
        },
    },
}));

interface Props {
    children: ReactNode;
}

const PrimaryLayout = ({ children }: Props): ReactElement => {
    const classes = useStyles();
    return (
        <>
            <Box className={classes.box}>
                <TopBar />
                {children}
            </Box>
        </>
    );
};

export default PrimaryLayout;
