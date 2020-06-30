import React, { ReactElement, useState } from 'react';
import {
    Box,
    Typography,
    makeStyles,
    Theme,
    Card,
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
} from '@material-ui/core';
import moment from 'moment';
import CakeIcon from '@material-ui/icons/Cake';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { dayMonthFormat } from '../../../lib/intlFormat';

const useStyles = makeStyles((theme: Theme) => ({
    list: {
        flex: 1,
        padding: 0,
        overflow: 'auto',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '322px',
        [theme.breakpoints.down('xs')]: {
            maxHeight: 'none',
        },
    },
    cardContent: {
        flex: 1,
    },
}));

interface Props {
    loading?: boolean;
    dueTasks?: {
        nodes: {
            id: string;
            subject: string;
            activityType: string;
            contacts: {
                nodes: {
                    name: string;
                }[];
            };
        }[];
        totalCount: number;
    };
    prayerRequestTasks?: {
        nodes: {
            id: string;
            subject: string;
            activityType: string;
            contacts: {
                nodes: {
                    name: string;
                }[];
            };
        }[];
        totalCount: number;
    };
    latePledgeContacts?: {
        nodes: {
            id: string;
            name: string;
            lateAt: string;
        }[];
        totalCount: number;
    };
    peopleWithBirthdays?: {
        id: string;
        birthdayDay: number;
        birthdayMonth: number;
        firstName: string;
        lastName: string;
        parentContact: {
            id: string;
        };
    }[];
    peopleWithAnniversaries?: {
        id: string;
        anniversaryDay: number;
        anniversaryMonth: number;
        parentContact: {
            id: string;
            name: string;
        };
    }[];
}

const ThisWeek = ({
    loading,
    dueTasks,
    prayerRequestTasks,
    latePledgeContacts,
    peopleWithBirthdays,
    peopleWithAnniversaries,
}: Props): ReactElement => {
    const classes = useStyles();
    const [value, setValue] = useState(0);

    const handleChange = (_event: React.ChangeEvent<{}>, newValue: number): void => {
        setValue(newValue);
    };

    return (
        <>
            <Box my={{ xs: 1, sm: 2 }}>
                <Typography variant="h6">To Do This Week</Typography>
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card className={classes.card}>
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
                                <List className={classes.list}>
                                    {prayerRequestTasks?.nodes?.map((task) => (
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
                                                        <Box component="div" textOverflow="ellipsis" overflow="hidden">
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
                        {value == 1 && (
                            <>
                                <List className={classes.list}>
                                    {peopleWithBirthdays?.map((person) => (
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
                                                        <Box component="div" textOverflow="ellipsis" overflow="hidden">
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
                                    {peopleWithAnniversaries?.map((person) => (
                                        <ListItem key={person.parentContact.id} button>
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
                            </>
                        )}
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card className={classes.card}>
                        <CardHeader title="Tasks Due This Week" />
                        <List className={classes.list}>
                            {dueTasks?.nodes?.map((task) => (
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
                                                <Box component="div" textOverflow="ellipsis" overflow="hidden">
                                                    <Typography component="span" variant="body2" color="textPrimary">
                                                        {task.activityType}
                                                    </Typography>{' '}
                                                    <Typography component="span" variant="body2" color="textSecondary">
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
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card className={classes.card}>
                        <CardHeader title="Late Commitments" />
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
                    </Card>
                </Grid>
            </Grid>
        </>
    );
};

export default ThisWeek;
