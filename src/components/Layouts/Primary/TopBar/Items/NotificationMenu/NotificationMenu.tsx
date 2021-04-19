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
import React, { ReactElement, useState } from 'react';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../../../../App';
import illustration13 from '../../../../../../images/drawkit/grape/drawkit-grape-pack-illustration-13.svg';
import NotificationMenuItem from './Item';
import {
  GetNotificationsDocument,
  GetNotificationsQuery,
  useGetNotificationsQuery,
} from './GetNotificationsQuery.generated';
import { useAcknowledgeAllUserNotificationsMutation } from './AcknowledgeAllUserNotifications.generated';

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

const NotificationMenu = (): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { state } = useApp();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();

  const { data, loading, fetchMore } = useGetNotificationsQuery({
    variables: {
      accountListId: state.accountListId ?? '',
      after: null,
    },
    skip: !state.accountListId,
    notifyOnNetworkStatusChange: true,
  });

  const [
    acknoweldgeAllUserNotifications,
  ] = useAcknowledgeAllUserNotificationsMutation();

  const handleAcknowledgeAllClick = () => {
    const optimisticResponse = true;
    acknoweldgeAllUserNotifications({
      variables: { accountListId: state.accountListId ?? '' },
      optimisticResponse: {
        acknowledgeAllUserNotifications: {
          notificationIds: [],
        },
      },
      update: (cache) => {
        if (!optimisticResponse) return;

        const query = {
          query: GetNotificationsDocument,
          variables: {
            accountListId: state.accountListId,
            after: null,
          },
        };
        const dataFromCache = cache.readQuery<GetNotificationsQuery>(query);
        const data = {
          userNotifications: {
            ...dataFromCache?.userNotifications,
            unreadCount: 0,
            nodes: dataFromCache?.userNotifications.nodes.map((node) => ({
              ...node,
              read: true,
            })),
          },
        };
        cache.writeQuery({ ...query, data });
      },
    });
    handleClose();
  };

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const handleFetchMore = () => {
    fetchMore({
      variables: { after: data?.userNotifications.pageInfo.endCursor },
    });
  };

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
          {data?.userNotifications?.unreadCount !== 0 ? (
            <NotificationsIcon />
          ) : (
            <NotificationsNoneIcon />
          )}
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
                  !data ||
                  data.userNotifications.nodes.filter(({ read }) => !read)
                    .length === 0
                }
                onClick={handleAcknowledgeAllClick}
              >
                {t('Mark all as read')}
              </Button>
            </Box>
          </Box>
        </ListSubheader>
        {data?.userNotifications?.nodes.map((item, index, nodes) => (
          <NotificationMenuItem
            key={item.id}
            item={item}
            previousItem={nodes[index - 1]}
            last={index + 1 === nodes.length && !loading}
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
        {!loading && data?.userNotifications.nodes.length === 0 && (
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
