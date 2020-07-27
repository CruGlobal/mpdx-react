import React, { ReactElement } from 'react';
import { makeStyles, Theme, CardContent, Typography, CardActions, Button, Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { currencyFormat } from '../../../lib/intlFormat';
import AnimatedCard from '../../AnimatedCard';
import AnimatedBox from '../../AnimatedBox';

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
                <AnimatedBox>
                    <Typography variant="h6">Account Balance</Typography>
                </AnimatedBox>
            </Box>
            <AnimatedCard className={classes.card}>
                <CardContent className={classes.cardContent}>
                    <Typography variant="h5" data-testid="BalanceTypography">
                        {loading ? <Skeleton variant="text" /> : currencyFormat(balance, currencyCode)}
                    </Typography>
                    <Typography>It may take a few days to update.</Typography>
                </CardContent>
                <CardActions>
                    <Button size="small" color="primary">
                        View Donations
                    </Button>
                </CardActions>
            </AnimatedCard>
        </>
    );
};

export default Balance;
