import React, { ReactElement } from 'react';
import {
    makeStyles,
    Theme,
    CardHeader,
    CardActions,
    Button,
    CardContent,
    Typography,
    Grid,
    Box,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AnimatedCard from '../../../AnimatedCard';
import { GetThisWeekQuery_accountList_primaryAppeal } from '../../../../../types/GetThisWeekQuery';
import StyledProgress from '../../../StyledProgress';
import { currencyFormat, percentageFormat } from '../../../../lib/intlFormat';
import HandoffLink from '../../../HandoffLink';

const useStyles = makeStyles((theme: Theme) => ({
    div: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    list: {
        flex: 1,
        padding: 0,
        overflow: 'auto',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        height: '322px',
        [theme.breakpoints.down('xs')]: {
            height: 'auto',
        },
    },
    cardContent: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing(2),
    },
    cardContentExpanded: {
        padding: theme.spacing(0, 2),
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(2),
        },
    },
    img: {
        height: '150px',
        marginBottom: theme.spacing(2),
    },
    pledgesAmountProcessed: {
        background: 'linear-gradient(180deg, #FFE67C 0%, #FFCF07 100%)',
    },
    pledgesAmountTotal: {
        border: '5px solid #FFCF07',
    },
    indicator: {
        display: 'inline-block',
        borderRadius: '18px',
        width: '18px',
        height: '18px',
        marginRight: '5px',
        marginBottom: '-3px',
    },
    titleContainer: {
        width: '100%',
    },
    title: {
        display: 'flex',
        marginBottom: theme.spacing(1),
        whiteSpace: 'nowrap',
    },
    titleContent: {
        flexGrow: 1,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
}));

interface Props {
    loading?: boolean;
    appeal?: GetThisWeekQuery_accountList_primaryAppeal;
}

const Appeals = ({ loading, appeal }: Props): ReactElement => {
    const classes = useStyles();
    const { t } = useTranslation();
    const pledgesAmountProcessedPercentage = (appeal?.pledgesAmountProcessed || 0) / (appeal?.amount || 0);
    const pledgesAmountTotalPercentage = (appeal?.pledgesAmountTotal || 0) / (appeal?.amount || 0);

    return (
        <AnimatedCard className={classes.card}>
            <CardHeader title={t('Appeals')} />
            {!loading && !appeal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={classes.div}
                >
                    <CardContent className={classes.cardContent} data-testid="AppealsCardContentEmpty">
                        <img
                            src={require('../../../../images/drawkit/grape/drawkit-grape-pack-illustration-13.svg')}
                            className={classes.img}
                            alt="empty"
                        />
                        {t('No primary appeal to show.')}
                    </CardContent>
                </motion.div>
            )}
            {(loading || appeal) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={classes.div}
                >
                    <CardContent className={[classes.cardContent, classes.cardContentExpanded].join(' ')}>
                        <Typography variant="h6" className={classes.titleContainer}>
                            <Box className={classes.title}>
                                <Box className={classes.titleContent} data-testid="AppealsBoxName">
                                    {loading ? <Skeleton variant="text" width="50%" /> : appeal.name}
                                </Box>
                                <Box data-testid="AppealsBoxAmount">
                                    {loading ? (
                                        <Skeleton variant="text" width={100} />
                                    ) : (
                                        currencyFormat(appeal.amount, appeal.amountCurrency)
                                    )}
                                </Box>
                            </Box>
                        </Typography>
                        <StyledProgress
                            loading={loading}
                            primary={pledgesAmountProcessedPercentage}
                            secondary={pledgesAmountTotalPercentage}
                        />
                        <Grid container spacing={2}>
                            <Grid xs={6} item>
                                <Typography component="div" color="textSecondary">
                                    <div className={[classes.indicator, classes.pledgesAmountProcessed].join(' ')} />
                                    {t('Gifts Received')}
                                </Typography>
                                <Typography
                                    variant="h5"
                                    data-testid="AppealsTypographyPledgesAmountProcessedPercentage"
                                >
                                    {loading ? (
                                        <Skeleton variant="text" />
                                    ) : (
                                        percentageFormat(pledgesAmountProcessedPercentage)
                                    )}
                                </Typography>
                                <Typography component="small" data-testid="AppealsTypographyPledgesAmountProcessed">
                                    {loading ? (
                                        <Skeleton variant="text" />
                                    ) : (
                                        currencyFormat(appeal.pledgesAmountProcessed, appeal.amountCurrency)
                                    )}
                                </Typography>
                            </Grid>
                            <Grid xs={6} item>
                                <Typography component="div" color="textSecondary">
                                    <div className={[classes.indicator, classes.pledgesAmountTotal].join(' ')} />
                                    {t('Commitments')}
                                </Typography>
                                <Typography variant="h5" data-testid="AppealsTypographyPledgesAmountTotalPercentage">
                                    {loading ? (
                                        <Skeleton variant="text" />
                                    ) : (
                                        percentageFormat(pledgesAmountTotalPercentage)
                                    )}
                                </Typography>
                                <Typography component="small" data-testid="AppealsTypographyPledgesAmountTotal">
                                    {loading ? (
                                        <Skeleton variant="text" />
                                    ) : (
                                        currencyFormat(appeal.pledgesAmountTotal, appeal.amountCurrency)
                                    )}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions>
                        <HandoffLink path="/tools/appeals">
                            <Button size="small" color="primary">
                                {t('View All')}
                            </Button>
                        </HandoffLink>
                    </CardActions>
                </motion.div>
            )}
        </AnimatedCard>
    );
};

export default Appeals;
