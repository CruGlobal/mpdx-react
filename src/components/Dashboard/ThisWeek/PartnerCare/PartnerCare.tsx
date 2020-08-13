import React, { ReactElement, useState } from 'react';
import {
    Box,
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
    Checkbox,
    Tabs,
    Tab,
    ListItemIcon,
    CardContent,
} from '@material-ui/core';
import CakeIcon from '@material-ui/icons/Cake';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { Skeleton } from '@material-ui/lab';
import { motion } from 'framer-motion';
import { uniqBy } from 'lodash/fp';
import { useTranslation } from 'react-i18next';
import { dayMonthFormat } from '../../../../lib/intlFormat';
import AnimatedCard from '../../../AnimatedCard';
import {
    GetThisWeekQuery_prayerRequestTasks,
    GetThisWeekQuery_reportsPeopleWithBirthdays,
    GetThisWeekQuery_reportsPeopleWithAnniversaries,
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

interface Props {
    loading?: boolean;
    prayerRequestTasks?: GetThisWeekQuery_prayerRequestTasks;
    reportsPeopleWithBirthdays?: GetThisWeekQuery_reportsPeopleWithBirthdays;
    reportsPeopleWithAnniversaries?: GetThisWeekQuery_reportsPeopleWithAnniversaries;
}

const PartnerCare = ({
    loading,
    prayerRequestTasks,
    reportsPeopleWithBirthdays,
    reportsPeopleWithAnniversaries,
}: Props): ReactElement => {
    const classes = useStyles();
    const { t } = useTranslation();
    const [value, setValue] = useState(0);

    const handleChange = (_event: React.ChangeEvent<{}>, newValue: number): void => {
        setValue(newValue);
    };

    return (
        <AnimatedCard className={classes.card}>
            <CardHeader title={t('Partner Care')} />
            <Tabs
                value={value}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                onChange={handleChange}
            >
                <Tab
                    label={t('Prayer ({{ totalCount, number }})', { totalCount: prayerRequestTasks?.totalCount || 0 })}
                    data-testid="PartnerCareTabPrayer"
                />
                <Tab
                    label={t('Celebrations ({{ totalCount, number }})', {
                        totalCount:
                            (reportsPeopleWithBirthdays?.periods[0]?.people?.length || 0) +
                            (reportsPeopleWithAnniversaries?.periods[0]?.people?.length || 0),
                    })}
                    data-testid="PartnerCareTabCelebrations"
                />
            </Tabs>
            {value == 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={classes.div}
                >
                    {loading && (
                        <>
                            <List className={classes.list} data-testid="PartnerCarePrayerListLoading">
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
                                    {t('View All ({{ totalCount, number }})', { totalCount: 0 })}
                                </Button>
                            </CardActions>
                        </>
                    )}
                    {!loading && (
                        <>
                            {(!prayerRequestTasks || prayerRequestTasks.nodes.length === 0) && (
                                <CardContent
                                    className={classes.cardContent}
                                    data-testid="PartnerCarePrayerCardContentEmpty"
                                >
                                    <img
                                        src={require('../../../../images/drawkit/grape/drawkit-grape-pack-illustration-4.svg')}
                                        className={classes.img}
                                        alt="empty"
                                    />
                                    {t('No prayer requests to show.')}
                                </CardContent>
                            )}
                            {prayerRequestTasks && prayerRequestTasks.nodes.length > 0 && (
                                <>
                                    <List className={classes.list} data-testid="PartnerCarePrayerList">
                                        {prayerRequestTasks.nodes.map((task) => (
                                            <ListItem
                                                key={task.id}
                                                button
                                                data-testid={`PartnerCarePrayerListItem-${task.id}`}
                                            >
                                                <ListItemText
                                                    disableTypography={true}
                                                    primary={
                                                        <Typography variant="body1">
                                                            {task.contacts.nodes.map(({ name }) => name).join(', ')}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Box style={{ whiteSpace: 'nowrap' }}>
                                                            <Box
                                                                component="div"
                                                                textOverflow="ellipsis"
                                                                overflow="hidden"
                                                            >
                                                                <Typography
                                                                    component="span"
                                                                    variant="body2"
                                                                    color="textSecondary"
                                                                >
                                                                    {task.subject}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    }
                                                />
                                                <ListItemSecondaryAction>
                                                    <Checkbox edge="end" />
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                    </List>
                                    <CardActions>
                                        <Button size="small" color="primary">
                                            {t('View All ({{ totalCount, number }})', {
                                                totalCount: prayerRequestTasks.totalCount,
                                            })}
                                        </Button>
                                    </CardActions>
                                </>
                            )}
                        </>
                    )}
                </motion.div>
            )}
            {value == 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={classes.div}
                >
                    {loading && (
                        <List className={classes.list} data-testid="PartnerCareCelebrationListLoading">
                            {[0, 1, 2].map((index) => (
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
                    )}
                    {!loading && (
                        <>
                            {(!reportsPeopleWithBirthdays ||
                                (reportsPeopleWithBirthdays.periods[0].people &&
                                    reportsPeopleWithBirthdays.periods[0].people.length === 0)) &&
                            (!reportsPeopleWithAnniversaries ||
                                (reportsPeopleWithAnniversaries.periods[0].people &&
                                    reportsPeopleWithAnniversaries.periods[0].people.length === 0)) ? (
                                <CardContent
                                    className={classes.cardContent}
                                    data-testid="PartnerCareCelebrationCardContentEmpty"
                                >
                                    <img
                                        src={require('../../../../images/drawkit/grape/drawkit-grape-pack-illustration-7.svg')}
                                        className={classes.img}
                                        alt="empty"
                                    />
                                    {t('No celebrations to show.')}
                                </CardContent>
                            ) : (
                                <List className={classes.list} data-testid="PartnerCareCelebrationList">
                                    {reportsPeopleWithBirthdays.periods[0].people.map((person) => (
                                        <ListItem
                                            key={person.id}
                                            button
                                            data-testid={`PartnerCareBirthdayListItem-${person.id}`}
                                        >
                                            <ListItemIcon>
                                                <CakeIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                disableTypography={true}
                                                primary={
                                                    <Typography variant="body1">
                                                        {person.firstName} {person.lastName}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box style={{ whiteSpace: 'nowrap' }}>
                                                        <Box component="div" textOverflow="ellipsis" overflow="hidden">
                                                            <Typography
                                                                component="span"
                                                                variant="body2"
                                                                color="textSecondary"
                                                            >
                                                                {dayMonthFormat(
                                                                    person.birthdayDay,
                                                                    person.birthdayMonth - 1,
                                                                )}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Checkbox edge="end" />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                    {uniqBy(
                                        ({ parentContact: id }) => id,
                                        reportsPeopleWithAnniversaries.periods[0].people,
                                    ).map((person) => (
                                        <ListItem
                                            key={person.id}
                                            data-testid={`PartnerCareAnniversaryListItem-${person.id}`}
                                            button
                                        >
                                            <ListItemIcon>
                                                <FavoriteIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                disableTypography={true}
                                                primary={
                                                    <Typography variant="body1">{person.parentContact.name}</Typography>
                                                }
                                                secondary={
                                                    <Box style={{ whiteSpace: 'nowrap' }}>
                                                        <Box component="div" textOverflow="ellipsis" overflow="hidden">
                                                            <Typography
                                                                component="span"
                                                                variant="body2"
                                                                color="textSecondary"
                                                            >
                                                                {dayMonthFormat(
                                                                    person.anniversaryDay,
                                                                    person.anniversaryMonth - 1,
                                                                )}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Checkbox edge="end" />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </>
                    )}
                </motion.div>
            )}
        </AnimatedCard>
    );
};

export default PartnerCare;
