import React, { ReactElement } from 'react';
import { Box, makeStyles, Theme, Container, Fab, CircularProgress } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    box: {
        backgroundColor: theme.palette.primary.main,
        height: '300px',
    },
    container: {
        textAlign: 'center',
        marginTop: '-30px',
        color: '#fff',
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
        <>
            <Box className={classes.box}></Box>
            <Container className={classes.container}>
                <Fab color="default" disableRipple className={classes.fab}>
                    <CircularProgress size={30} />
                </Fab>
            </Container>
        </>
    );
};

export default Loading;
