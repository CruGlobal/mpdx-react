import React, { ReactElement } from 'react';
import { Box, Container, Typography, makeStyles, Theme, Grid } from '@material-ui/core';
import PageHeading from '../../PageHeading';

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
        <PageHeading
            heading={
                <>
                    <Typography variant="h4" component="h1">
                        {greeting}
                    </Typography>
                    <Typography>Welcome back to MPDX. Here&apos;s what&apos;s been happening.</Typography>
                </>
            }
            illustration={9}
            overlap={20}
        />
    );
};

export default Welcome;
