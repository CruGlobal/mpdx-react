import React, { ReactElement } from 'react';
import { makeStyles, Theme, Card, CardContent, Typography, CardActions, Button, Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { currencyFormat } from '../../../lib/intlFormat';

const useStyles = makeStyles((theme: Theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.up('sm')]: {
            height: 'calc(100% - 65px)',
        },
    },
    cardContent: {
        flex: '1',
    },
}));

interface Props {
    loading?: boolean;
    balance?: number;
    currencyCode?: string;
}

const Balance = ({ loading, balance, currencyCode = 'USD' }: Props): ReactElement => {
    const classes = useStyles();

    return (
        <>
            <Box my={{ xs: 1, sm: 2 }}>
                <Typography variant="h6">Account Balance</Typography>
            </Box>
            <Card className={classes.card}>
                <CardContent className={classes.cardContent}>
                    <Typography variant="h5">
                        {loading ? <Skeleton variant="text" /> : currencyFormat(balance, currencyCode)}
                    </Typography>
                    <Typography>It may take a few days to update.</Typography>
                </CardContent>
                <CardActions>
                    <Button size="small" color="primary">
                        View Donations
                    </Button>
                </CardActions>
            </Card>
        </>
    );
};

export default Balance;
