import { Badge, Box, Button, IconButton, ListItem, ListSubheader, makeStyles, Menu, Theme } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { useQuery, gql, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash/fp';
import { useApp } from '../../../../App';
import { GetNotificationsQuery } from '../../../../../../types/GetNotificationsQuery';
import { AcknowledgeAllUserNotificationsMutation } from '../../../../../../types/AcknowledgeAllUserNotificationsMutation';
import NotificationMenuItem from './Item';

const useStyles = makeStyles((theme: Theme) => ({
    link: {
        textTransform: 'none',
        color: 'rgba(255,255,255,0.75)',
        transition: 'color 0.2s ease-in-out',
        '&:hover': {
            color: 'rgba(255,255,255,1)',
        },
    },
    menuPaper: {
        width: '50ch',
        [theme.breakpoints.down('xs')]: {
            width: '100%',
        },
    },
    menuButton: {
        width: '100%',
    },
    listSubheader: {
        outline: 0,
    },
    listItemEmpty: {
        flexDirection: 'column',
        paddingBottom: theme.spacing(2),
    },
    img: {
        height: '150px',
        marginBottom: theme.spacing(2),
    },
}));

export const GET_NOTIFICATIONS_QUERY = gql`
    query GetNotificationsQuery($accountListId: ID!, $after: String) {
        userNotifications(accountListId: $accountListId, after: $after) {
            nodes {
                id
                read
                notification {
                    occurredAt
                    contact {
                        id
                        name
                    }
                    donation {
                        id
                        amount {
                            amount
                            currency
                            conversionDate
                        }
                    }
                    notificationType {
                        id
                        type
                        descriptionTemplate
                    }
                }
            }
            pageInfo {
                endCursor
                hasNextPage
            }
            unreadCount
        }
    }
`;

export const ACKNOWLEDGE_ALL_USER_NOTIFICATIONS_MUTATION = gql`
    mutation AcknowledgeAllUserNotificationsMutation($accountListId: ID!) {
        acknowledgeAllUserNotifications(input: { accountListId: $accountListId }) {
            notificationIds
        }
    }
`;

const NotificationMenu = (): ReactElement => {
    const classes = useStyles();
    const { t } = useTranslation();
    const { state } = useApp();
    const [anchorEl, setAnchorEl] = useState(null);

    const { data, loading, fetchMore, refetch } = useQuery<GetNotificationsQuery>(GET_NOTIFICATIONS_QUERY, {
        notifyOnNetworkStatusChange: true,
        variables: {
            accountListId: state.accountListId,
            after: null,
        },
    });

    const [acknoweldgeAllUserNotifications] = useMutation<AcknowledgeAllUserNotificationsMutation>(
        ACKNOWLEDGE_ALL_USER_NOTIFICATIONS_MUTATION,
    );

    const handleAcknowledgeAllClick = () => {
        acknoweldgeAllUserNotifications({
            variables: { accountListId: state.accountListId },
            optimisticResponse: {
                acknowledgeAllUserNotifications: {
                    notificationIds: [],
                },
            },
            update: (cache) => {
                const query = {
                    query: GET_NOTIFICATIONS_QUERY,
                    variables: {
                        accountListId: state.accountListId,
                        after: null,
                    },
                };
                const data = cloneDeep(cache.readQuery<GetNotificationsQuery>(query));
                data.userNotifications.unreadCount = 0;
                data.userNotifications.nodes = data.userNotifications.nodes.map((notification) => ({
                    ...notification,
                    read: true,
                }));
                cache.writeQuery({ ...query, data });
            },
        });
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleFetchMore = () => {
        fetchMore({
            variables: { after: data.userNotifications.pageInfo.endCursor },
            updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;
                return {
                    userNotifications: {
                        ...fetchMoreResult.userNotifications,
                        nodes: [...prev.userNotifications.nodes, ...fetchMoreResult.userNotifications.nodes],
                    },
                };
            },
        });
    };

    useEffect(() => {
        if (state?.accountListId) {
            refetch({ after: null });
        }
    }, [state?.accountListId]);

    return (
        <>
            <IconButton
                className={classes.link}
                aria-controls="notification-menu"
                aria-haspopup="true"
                onClick={handleClick}
            >
                <Badge badgeContent={data?.userNotifications?.unreadCount} color="secondary">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                id="notification-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                classes={{ paper: classes.menuPaper }}
            >
                <ListSubheader className={classes.listSubheader}>
                    <Box display="flex" flexDirection="row" justifyContent="center">
                        <Box flexGrow={1}>{t('Notifications')}</Box>
                        <Box>
                            <Button
                                size="small"
                                disabled={
                                    data?.userNotifications?.nodes === undefined ||
                                    data.userNotifications.nodes.filter(({ read }) => !read).length === 0
                                }
                                onClick={handleAcknowledgeAllClick}
                            >
                                {t('Mark all as read')}
                            </Button>
                        </Box>
                    </Box>
                </ListSubheader>
                {data?.userNotifications?.nodes?.map((item, index) => (
                    <NotificationMenuItem
                        key={item.id}
                        item={item}
                        last={index + 1 === data.userNotifications.nodes.length && !loading}
                    />
                ))}
                {!loading && data?.userNotifications?.pageInfo?.hasNextPage && (
                    <ListItem>
                        <Button
                            className={classes.menuButton}
                            variant="outlined"
                            color="default"
                            onClick={handleFetchMore}
                        >
                            {t('Load More')}
                        </Button>
                    </ListItem>
                )}
                {!loading && data?.userNotifications?.nodes?.length === 0 && (
                    <ListItem className={classes.listItemEmpty}>
                        <img
                            src={require('../../../../../images/drawkit/grape/drawkit-grape-pack-illustration-13.svg')}
                            className={classes.img}
                            alt="empty"
                        />
                        {t('No notifications to show.')}
                    </ListItem>
                )}
                {loading && (
                    <>
                        <NotificationMenuItem />
                        <NotificationMenuItem last={true} />
                    </>
                )}
            </Menu>
        </>
    );
};

export default NotificationMenu;
