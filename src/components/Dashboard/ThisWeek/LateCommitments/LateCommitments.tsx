import React, { ReactElement } from 'react';
import {
    makeStyles,
    Theme,
    CardHeader,
    CardActions,
    Button,
    List,
    ListItem,
    ListItemText,
    CardContent,
} from '@material-ui/core';
import moment from 'moment';
import { Skeleton } from '@material-ui/lab';
import { motion } from 'framer-motion';
import AnimatedCard from '../../../AnimatedCard';
import { GetThisWeekQuery_latePledgeContacts } from '../../../../../types/GetThisWeekQuery';

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
        height: '150px',
        marginBottom: theme.spacing(2),
    },
}));

interface Props {
    loading: boolean;
    latePledgeContacts?: GetThisWeekQuery_latePledgeContacts;
}

const LateCommitments = ({ loading, latePledgeContacts }: Props): ReactElement => {
    const classes = useStyles();

    return (
        <AnimatedCard className={classes.card}>
            <CardHeader title="Late Commitments" />
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={classes.div}
                >
                    <List className={classes.list}>
                        {[0, 1, 2].map((index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={<Skeleton variant="text" width={100} />}
                                    secondary={<Skeleton variant="text" width={200} />}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <CardActions>
                        <Button size="small" color="primary" disabled>
                            View All (0)
                        </Button>
                    </CardActions>
                </motion.div>
            )}
            {!loading && latePledgeContacts?.nodes && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={classes.div}
                >
                    {latePledgeContacts.nodes.length === 0 && (
                        <CardContent className={classes.cardContent}>
                            <img
                                src={require('../../../../images/drawkit/grape/drawkit-grape-pack-illustration-14.svg')}
                                className={classes.img}
                            />
                            No late commitments to show.
                        </CardContent>
                    )}
                    {latePledgeContacts.nodes.length > 0 && (
                        <>
                            <List className={classes.list}>
                                {latePledgeContacts?.nodes?.map((contact) => {
                                    const days = moment().diff(moment(contact.lateAt), 'days');
                                    return (
                                        <ListItem key={contact.id} button>
                                            <ListItemText
                                                primary={contact.name}
                                                secondary={`Their gift is ${days} days late.`}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                            <CardActions>
                                <Button size="small" color="primary">
                                    View All ({latePledgeContacts?.totalCount || 0})
                                </Button>
                            </CardActions>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatedCard>
    );
};

export default LateCommitments;
