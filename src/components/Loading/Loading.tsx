import React, { ReactElement } from 'react';
import { Box, makeStyles, Theme, Fab, CircularProgress } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    box: {
        position: 'fixed',
        top: '50%',
        left: '50%',
    },
    fab: {
        backgroundColor: '#fff',
        cursor: 'default',
        '&:hover': {
            backgroundColor: '#fff',
        },
    },
}));

const Loading = (): ReactElement => {
    const classes = useStyles();
    return (
        <Box className={classes.box}>
            <Fab color="default" disableRipple className={classes.fab}>
                <CircularProgress size={30} />
            </Fab>
        </Box>
    );
};

export default Loading;
