import React, { ReactElement, useState } from 'react';
import {
    Typography,
    makeStyles,
    Theme,
    CardHeader,
    CardActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Tabs,
    Tab,
    CardContent,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { motion } from 'framer-motion';
import AnimatedCard from '../../../AnimatedCard';
import {
    GetThisWeekQuery_onHandReferrals,
    GetThisWeekQuery_recentReferrals,
} from '../../../../../types/GetThisWeekQuery';

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
        padding: theme.spacing(2),
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    img: {
        height: '120px',
        marginBottom: 0,
        [theme.breakpoints.down('xs')]: {
            height: '150px',
            marginBottom: theme.spacing(2),
        },
    },
}));

interface ReferralsTabProps {
    loading: boolean;
    referrals: GetThisWeekQuery_onHandReferrals | GetThisWeekQuery_recentReferrals;
}

const ReferralsTab = ({ loading, referrals }: ReferralsTabProps): ReactElement => {
    const classes = useStyles();

    return (
        <>
            {loading && (
                <>
                    <List className={classes.list}>
                        {[0, 1].map((index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={<Skeleton variant="text" width={100} />}
                                    secondary={<Skeleton variant="text" width={200} />}
                                />
                                <ListItemSecondaryAction>
                                    <Skeleton variant="rect" width={20} height={20} />
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                    <CardActions>
                        <Button size="small" color="primary" disabled>
                            View All (0)
                        </Button>
                    </CardActions>
                </>
            )}
            {!loading && referrals?.nodes && (
                <>
                    {referrals.nodes.length === 0 && (
                        <CardContent className={classes.cardContent}>
                            <img
                                src={require('../../../../images/drawkit/grape/drawkit-grape-pack-illustration-4.svg')}
                                className={classes.img}
                            />
                            No referrals to show.
                        </CardContent>
                    )}
                    {referrals.nodes.length > 0 && (
                        <>
                            <List className={classes.list}>
                                {referrals.nodes.map((contact) => (
                                    <ListItem key={contact.id} button>
                                        <ListItemText
                                            disableTypography={true}
                                            primary={<Typography variant="body1">{contact.name}</Typography>}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <CardActions>
                                <Button size="small" color="primary">
                                    View All ({referrals?.totalCount || 0})
                                </Button>
                            </CardActions>
                        </>
                    )}
                </>
            )}
        </>
    );
};

interface Props {
    loading: boolean;
    recentReferrals?: GetThisWeekQuery_recentReferrals;
    onHandReferrals?: GetThisWeekQuery_onHandReferrals;
}

const Referrals = ({ loading, recentReferrals, onHandReferrals }: Props): ReactElement => {
    const classes = useStyles();
    const [value, setValue] = useState(0);

    const handleChange = (_event: React.ChangeEvent<{}>, newValue: number): void => {
        setValue(newValue);
    };

    return (
        <AnimatedCard className={classes.card}>
            <CardHeader title="Referrals" />
            <Tabs
                value={value}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                onChange={handleChange}
            >
                <Tab label={`Recent (${recentReferrals?.totalCount || 0})`} />
                <Tab label={`On Hand (${onHandReferrals?.totalCount || 0})`} />
            </Tabs>
            {value == 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={classes.div}
                >
                    <ReferralsTab loading={loading} referrals={recentReferrals} />
                </motion.div>
            )}
            {value == 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={classes.div}
                >
                    <ReferralsTab loading={loading} referrals={onHandReferrals} />
                </motion.div>
            )}
        </AnimatedCard>
    );
};

export default Referrals;
