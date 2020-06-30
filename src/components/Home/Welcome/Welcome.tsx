import React, { ReactElement } from 'react';
import { Box, Container, Typography, Button, makeStyles, Theme, Grid } from '@material-ui/core';
import SubjectIcon from '@material-ui/icons/Subject';

const useStyles = makeStyles((theme: Theme) => ({
    box: {
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
    },
    subtitle: {
        maxWidth: '450px',
    },
    button: {
        color: '#fff',
    },
}));

const Welcome = (): ReactElement => {
    const classes = useStyles();

    return (
        <Box className={classes.box} py={10}>
            <Container>
                <Grid container spacing={2} alignItems="center">
                    <Grid item sm={8}>
                        <Typography variant="h4" component="h1">
                            Welcome to MPDX
                        </Typography>
                        <Box my={3} className={classes.subtitle}>
                            <Typography>
                                MPDX is fundraising software from Cru that helps you grow and maintain your ministry
                                partners in a quick and easy way.
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item>
                                <Button size="large" variant="contained">
                                    Get Started
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    className={classes.button}
                                    size="large"
                                    variant="outlined"
                                    startIcon={<SubjectIcon />}
                                    href="https://help.mpdx.org"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Find help
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sm={4}>
                        <img src="/drawkit/grape/drawkit-grape-pack-illustration-2.svg" alt="illustration" />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Welcome;
