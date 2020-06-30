import React, { ReactElement } from 'react';
import { Box, Container, Typography, makeStyles, Theme, Grid } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    box: {
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
    },
    image: {
        maxHeight: '150px',
        overflow: 'hidden',
        '& img': {
            height: '250px',
        },
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
}));

interface Props {
    firstName?: string;
}

const Welcome = ({ firstName }: Props): ReactElement => {
    const classes = useStyles();

    const today = new Date();
    const currentHour = today.getHours();

    let greeting = 'Good Evening,';
    if (currentHour < 12) {
        greeting = 'Good Morning,';
    } else if (currentHour < 18) {
        greeting = 'Good Afternoon,';
    }
    if (firstName) {
        greeting = greeting + ` ${firstName}.`;
    }

    return (
        <Box className={classes.box} pb={{ xs: 5, sm: 0 }} pt={{ xs: 6, sm: 3 }}>
            <Container>
                <Grid container spacing={4} alignItems="flex-end" justify="center">
                    <Grid item className={classes.image}>
                        <img src="/drawkit/grape/drawkit-grape-pack-illustration-9.svg" alt="illustration" />
                    </Grid>
                    <Grid item>
                        <Typography variant="h4" component="h1">
                            {greeting}
                        </Typography>
                        <Typography>Welcome back to MPDX. Here&apos;s what&apos;s been happening.</Typography>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Welcome;
