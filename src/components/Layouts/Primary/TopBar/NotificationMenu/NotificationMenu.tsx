import {
  Badge,
  Box,
  Button,
  IconButton,
  ListItem,
  ListSubheader,
  makeStyles,
  Menu,
  Theme,
} from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../../../App';
import { GetNotificationsQuery } from '../../../../../../types/GetNotificationsQuery';
import { AcknowledgeAllUserNotificationsMutation } from '../../../../../../types/AcknowledgeAllUserNotificationsMutation';
import illustration13 from '../../../../../images/drawkit/grape/drawkit-grape-pack-illustration-13.svg';
import NotificationMenuItem from './Item';
import GET_NOTIFICATIONS_QUERY from './getNotificationsQuery.graphql';

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
  menuList: {
    padding: 0,
  },
  menuButton: {
    width: '100%',
    marginBottom: theme.spacing(1),
  },
  listSubheader: {
    outline: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 2,
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

  const [
    getNotifications,
    { data, loading, fetchMore },
  ] = useLazyQuery<GetNotificationsQuery>(GET_NOTIFICATIONS_QUERY, {
    notifyOnNetworkStatusChange: true,
  });

  const [
    acknoweldgeAllUserNotifications,
  ] = useMutation<AcknowledgeAllUserNotificationsMutation>(
    ACKNOWLEDGE_ALL_USER_NOTIFICATIONS_MUTATION,
  );

  const handleAcknowledgeAllClick = () => {
    const optimisticResponse = true;
    acknoweldgeAllUserNotifications({
      variables: { accountListId: state.accountListId },
      optimisticResponse: {
        acknowledgeAllUserNotifications: {
          notificationIds: [],
        },
      },
      update: (cache) => {
        console.log(cache);
        if (!optimisticResponse) return;

        const query = {
          query: GET_NOTIFICATIONS_QUERY,
          variables: {
            accountListId: state.accountListId,
            after: null,
          },
        };
        const dataFromCache = cache.readQuery<GetNotificationsQuery>(query);
        const data = {
          userNotifications: {
            ...dataFromCache.userNotifications,
          },
        };
        data.userNotifications.unreadCount = 0;
        data.userNotifications.edges = data.userNotifications.edges.map(
          ({ node }) => ({
            node: {
              ...node,
              read: true,
            },
          }),
        );
        cache.writeQuery({ ...query, data });
      },
    });
    handleClose();
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
    });
  };

  useEffect(() => {
    if (state?.accountListId) {
      getNotifications({
        variables: {
          accountListId: state.accountListId,
          after: null,
        },
      });
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
        <Badge
          badgeContent={data?.userNotifications?.unreadCount}
          color="secondary"
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        classes={{ paper: classes.menuPaper, list: classes.menuList }}
      >
        <ListSubheader className={classes.listSubheader}>
          <Box display="flex" flexDirection="row" justifyContent="center">
            <Box flexGrow={1}>{t('Notifications')}</Box>
            <Box>
              <Button
                size="small"
                disabled={
                  data?.userNotifications?.edges === undefined ||
                  data.userNotifications.edges.filter(
                    ({ node: { read } }) => !read,
                  ).length === 0
                }
                onClick={handleAcknowledgeAllClick}
              >
                {t('Mark all as read')}
              </Button>
            </Box>
          </Box>
        </ListSubheader>
        {data?.userNotifications?.edges?.map(({ node: item }, index) => (
          <NotificationMenuItem
            key={item.id}
            item={item}
            previousItem={data.userNotifications.edges[index - 1]?.node}
            last={index + 1 === data.userNotifications.edges.length && !loading}
            onClick={handleClose}
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
        {!loading && data?.userNotifications?.edges?.length === 0 && (
          <ListItem className={classes.listItemEmpty}>
            <img src={illustration13} className={classes.img} alt="empty" />
            {t('No notifications to show.')}
          </ListItem>
        )}
        {loading && (
          <Box data-testid="NotificationMenuLoading">
            <NotificationMenuItem />
            <NotificationMenuItem last={true} />
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu;
