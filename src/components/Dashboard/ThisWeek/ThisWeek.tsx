import React, { ReactElement, useState } from 'react';
import {
    Box,
    Typography,
    makeStyles,
    Theme,
    Grid,
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
import moment from 'moment';
import CakeIcon from '@material-ui/icons/Cake';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { gql, useQuery } from '@apollo/client';
import { Skeleton } from '@material-ui/lab';
import { dayMonthFormat } from '../../../lib/intlFormat';
import AnimatedCard from '../../AnimatedCard';
import AnimatedBox from '../../AnimatedBox';
import { GetThisWeekQuery } from '../../../../types/GetThisWeekQuery';

const useStyles = makeStyles((theme: Theme) => ({
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
    tabImg: {
        height: '120px',
        marginBottom: 0,
        [theme.breakpoints.down('xs')]: {
            height: '150px',
            marginBottom: theme.spacing(2),
        },
    },
}));

interface Props {
    accountListId: string;
}

export const GET_THIS_WEEK_QUERY = gql`
    query GetThisWeekQuery(
        $accountListId: ID!
        $endOfDay: ISO8601DateTime!
        $today: ISO8601Date!
        $twoWeeksFromNow: ISO8601Date!
    ) {
        dueTasks: tasks(accountListId: $accountListId, first: 3, startAt: { max: $endOfDay }) {
            nodes {
                id
                subject
                activityType
                contacts {
                    nodes {
                        name
                    }
                }
            }
            totalCount
        }
        prayerRequestTasks: tasks(accountListId: $accountListId, first: 3, activityType: PRAYER_REQUEST) {
            nodes {
                id
                subject
                activityType
                contacts {
                    nodes {
                        name
                    }
                }
            }
            totalCount
        }
        latePledgeContacts: contacts(accountListId: $accountListId, first: 3, lateAt: { max: $today }) {
            nodes {
                id
                name
                lateAt
            }
            totalCount
        }
        reportsPeopleWithBirthdays(accountListId: $accountListId, range: "1m", endDate: $twoWeeksFromNow) {
            periods {
                people {
                    id
                    birthdayDay
                    birthdayMonth
                    firstName
                    lastName
                    parentContact {
                        id
                    }
                }
            }
        }
        reportsPeopleWithAnniversaries(accountListId: $accountListId, range: "1m", endDate: $twoWeeksFromNow) {
            periods {
                people {
                    id
                    anniversaryDay
                    anniversaryMonth
                    parentContact {
                        id
                        name
                    }
                }
            }
        }
    }
`;

const ThisWeek = ({ accountListId }: Props): ReactElement => {
    const classes = useStyles();
    const [value, setValue] = useState(0);
    const { data, loading } = useQuery<GetThisWeekQuery>(GET_THIS_WEEK_QUERY, {
        variables: {
            accountListId,
            endOfDay: moment().endOf('day').toISOString(),
            today: moment().endOf('day').toISOString().slice(0, 10),
            twoWeeksFromNow: moment().endOf('day').add(2, 'weeks').toISOString().slice(0, 10),
        },
    });

    const {
        dueTasks,
        prayerRequestTasks,
        latePledgeContacts,
        reportsPeopleWithBirthdays,
        reportsPeopleWithAnniversaries,
    } = data || {};

    const handleChange = (_event: React.ChangeEvent<{}>, newValue: number): void => {
        setValue(newValue);
    };

    return (
        <>
            <Box my={{ xs: 1, sm: 2 }}>
                <AnimatedBox>
                    <Typography variant="h6">To Do This Week</Typography>
                </AnimatedBox>
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <AnimatedCard className={classes.card}>
                        <CardHeader title="Partner Care" />
                        <Tabs
                            value={value}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="fullWidth"
                            onChange={handleChange}
                        >
                            <Tab label="Prayer" />
                            <Tab label="Celebrations" />
                        </Tabs>
                        {value == 0 && (
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
                                {!loading && prayerRequestTasks?.nodes && (
                                    <>
                                        {prayerRequestTasks.nodes.length === 0 && (
                                            <CardContent className={classes.cardContent}>
                                                <img
                                                    src="/drawkit/grape/drawkit-grape-pack-illustration-4.svg"
                                                    className={classes.tabImg}
                                                />
                                                No prayer requests to show.
                                            </CardContent>
                                        )}
                                        {prayerRequestTasks.nodes.length > 0 && (
                                            <>
                                                <List className={classes.list}>
                                                    {prayerRequestTasks.nodes.map((task) => (
                                                        <ListItem key={task.id} button>
                                                            <ListItemText
                                                                disableTypography={true}
                                                                primary={
                                                                    <Typography variant="body1">
                                                                        {task.contacts.nodes
                                                                            .map(({ name }) => name)
                                                                            .join(', ')}
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
                                                        View All ({prayerRequestTasks?.totalCount || 0})
                                                    </Button>
                                                </CardActions>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {value == 1 && (
                            <>
                                {loading && (
                                    <List className={classes.list}>
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
                                {!loading &&
                                    reportsPeopleWithBirthdays?.periods[0]?.people &&
                                    reportsPeopleWithAnniversaries?.periods[0]?.people &&
                                    reportsPeopleWithBirthdays.periods[0].people.length === 0 &&
                                    reportsPeopleWithAnniversaries.periods[0].people.length === 0 && (
                                        <CardContent className={classes.cardContent}>
                                            <img
                                                src="/drawkit/grape/drawkit-grape-pack-illustration-7.svg"
                                                className={classes.tabImg}
                                            />
                                            No celebrations to show.
                                        </CardContent>
                                    )}
                                {!loading &&
                                    reportsPeopleWithBirthdays?.periods[0]?.people &&
                                    reportsPeopleWithAnniversaries?.periods[0]?.people &&
                                    (reportsPeopleWithBirthdays.periods[0].people.length > 0 ||
                                        reportsPeopleWithAnniversaries.periods[0].people.length > 0) && (
                                        <List className={classes.list}>
                                            {reportsPeopleWithBirthdays?.periods[0]?.people?.map((person) => (
                                                <ListItem key={person.id} button>
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
                                                                        {dayMonthFormat(
                                                                            person.birthdayDay,
                                                                            person.birthdayMonth,
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
                                            {reportsPeopleWithAnniversaries?.periods[0]?.people?.map((person) => (
                                                <ListItem key={person.parentContact.id} button>
                                                    <ListItemIcon>
                                                        <FavoriteIcon />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        disableTypography={true}
                                                        primary={
                                                            <Typography variant="body1">
                                                                {person.parentContact.name}
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
                                                                        {dayMonthFormat(
                                                                            person.anniversaryDay,
                                                                            person.anniversaryMonth,
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
                    </AnimatedCard>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <AnimatedCard className={classes.card}>
                        <CardHeader title="Tasks Due This Week" />
                        {loading && (
                            <>
                                <List className={classes.list}>
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
                                <CardActions>
                                    <Button size="small" color="primary" disabled>
                                        View All (0)
                                    </Button>
                                </CardActions>
                            </>
                        )}
                        {!loading && dueTasks?.nodes && (
                            <>
                                {dueTasks.nodes.length === 0 && (
                                    <CardContent className={classes.cardContent}>
                                        <img
                                            src="/drawkit/grape/drawkit-grape-pack-illustration-8.svg"
                                            className={classes.img}
                                        />
                                        No tasks to show.
                                    </CardContent>
                                )}
                                {dueTasks.nodes.length > 0 && (
                                    <>
                                        <List className={classes.list}>
                                            {dueTasks.nodes.map((task) => (
                                                <ListItem key={task.id} button>
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
                                                                        color="textPrimary"
                                                                    >
                                                                        {task.activityType}
                                                                    </Typography>{' '}
                                                                    <Typography
                                                                        component="span"
                                                                        variant="body2"
                                                                        color="textSecondary"
                                                                    >
                                                                        — {task.subject}
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
                                                View All ({dueTasks?.totalCount || 0})
                                            </Button>
                                        </CardActions>
                                    </>
                                )}
                            </>
                        )}
                    </AnimatedCard>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <AnimatedCard className={classes.card}>
                        <CardHeader title="Late Commitments" />
                        {loading && (
                            <>
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
                            </>
                        )}
                        {!loading && latePledgeContacts?.nodes && (
                            <>
                                {latePledgeContacts.nodes.length === 0 && (
                                    <CardContent className={classes.cardContent}>
                                        <img
                                            src="/drawkit/grape/drawkit-grape-pack-illustration-14.svg"
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
                            </>
                        )}
                    </AnimatedCard>
                </Grid>
            </Grid>
        </>
    );
};

export default ThisWeek;
