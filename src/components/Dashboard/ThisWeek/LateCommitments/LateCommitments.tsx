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
import { DateTime } from 'luxon';
import { Skeleton } from '@material-ui/lab';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { endOfDay, formatISO } from 'date-fns';
import AnimatedCard from '../../../AnimatedCard';
import { GetThisWeekQuery_latePledgeContacts } from '../../../../../types/GetThisWeekQuery';
import HandoffLink from '../../../HandoffLink';
import illustration14 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-14.svg';

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
    loading?: boolean;
    latePledgeContacts?: GetThisWeekQuery_latePledgeContacts;
}

const LateCommitments = ({ loading, latePledgeContacts }: Props): ReactElement => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <AnimatedCard className={classes.card}>
            <CardHeader title={t('Late Commitments')} />
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={classes.div}
                    data-testid="LateCommitmentsDivLoading"
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
                            {t('View All ({{ totalCount, number }})', { totalCount: 0 })}
                        </Button>
                    </CardActions>
                </motion.div>
            )}
            {!loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={classes.div}
                >
                    {(!latePledgeContacts || latePledgeContacts.nodes.length === 0) && (
                        <CardContent className={classes.cardContent} data-testid="LateCommitmentsCardContentEmpty">
                            <img src={illustration14} className={classes.img} alt="empty" />
                            {t('No late commitments to show.')}
                        </CardContent>
                    )}
                    {latePledgeContacts && latePledgeContacts.nodes.length > 0 && (
                        <>
                            <List className={classes.list} data-testid="LateCommitmentsListContacts">
                                {latePledgeContacts.nodes.map((contact) => {
                                    const todayDate = DateTime.local().toISODate();
                                    const date = DateTime.fromISO(contact.lateAt).toISODate();
                                    const count = DateTime.local().diff(DateTime.fromISO(contact.lateAt), 'days').days;
                                    return (
                                        <HandoffLink key={contact.id} path={`/contacts/${contact.id}`}>
                                            <ListItem
                                                component="a"
                                                button
                                                data-testid={`LateCommitmentsListItemContact-${contact.id}`}
                                            >
                                                <ListItemText
                                                    primary={contact.name}
                                                    secondary={t('Their gift is {{ count, number }} day late.', {
                                                        count,
                                                    })}
                                                />
                                            </ListItem>
                                        </HandoffLink>
                                    );
                                })}
                            </List>
                            <CardActions>
                                <HandoffLink
                                    path={`/contacts?filters=${encodeURIComponent(
                                        JSON.stringify({
                                            late_at: `1970-01-01..${DateTime.local().endOf('day').toISODate()}`,
                                            status: 'Partner - Financial',
                                        }),
                                    )}`}
                                >
                                    <Button size="small" color="primary" data-testid="LateCommitmentsButtonViewAll">
                                        {t('View All ({{ totalCount, number }})', {
                                            totalCount: latePledgeContacts?.totalCount,
                                        })}
                                    </Button>
                                </HandoffLink>
                            </CardActions>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatedCard>
    );
};

export default LateCommitments;
