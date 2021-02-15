import { useMutation, gql } from '@apollo/client';
import {
  Avatar,
  Badge,
  Box,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep, isFunction } from 'lodash/fp';
import { isSameMonth } from 'date-fns';
import { AcknowledgeUserNotificationMutation } from '../../../../../../../types/AcknowledgeUserNotificationMutation';
import {
  GetNotificationsQuery,
  GetNotificationsQuery_userNotifications_edges_node as Notification,
} from '../../../../../../../types/GetNotificationsQuery';
import { NotificationTypeTypeEnum } from '../../../../../../../types/globalTypes';
import {
  dateFormat,
  monthYearFormat,
} from '../../../../../../lib/intlFormat/intlFormat';
import { useApp } from '../../../../../App';
import HandoffLink from '../../../../../HandoffLink';
import GET_NOTIFICATIONS_QUERY from '../getNotificationsQuery.graphql';

export const ACKNOWLEDGE_USER_NOTIFICATION_MUTATION = gql`
  mutation AcknowledgeUserNotificationMutation($notificationId: ID!) {
    acknowledgeUserNotification(input: { notificationId: $notificationId }) {
      notification {
        id
        read
      }
    }
  }
`;

interface Props {
  item?: Notification;
  last?: boolean;
  previousItem?: Notification;
  onClick?: () => void;
}

const NotificationMenuItem = ({
  item,
  previousItem,
  last,
  onClick,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const { state } = useApp();

  if (!item) {
    return (
      <Box>
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Skeleton variant="circle" width={40} height={40} />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton />}
            secondary={<Skeleton width={100} />}
          />
        </ListItem>
        {!last && <Divider variant="inset" />}
      </Box>
    );
  }

  const amount = item.notification.donation?.amount;
  const [
    acknoweldgeUserNotification,
  ] = useMutation<AcknowledgeUserNotificationMutation>(
    ACKNOWLEDGE_USER_NOTIFICATION_MUTATION,
  );
  const handleClick = async () => {
    let optimisticResponse = true;
    if (!item.read) {
      await acknoweldgeUserNotification({
        variables: { notificationId: item.id },
        optimisticResponse: {
          acknowledgeUserNotification: {
            notification: {
              id: item.id,
              read: true,
            },
          },
        },
        update: (cache) => {
          if (!optimisticResponse) return;

          const query = {
            query: GET_NOTIFICATIONS_QUERY,
            variables: {
              accountListId: state.accountListId,
              after: null,
            },
          };
          const data = cloneDeep(cache.readQuery<GetNotificationsQuery>(query));
          data.userNotifications.unreadCount--;
          cache.writeQuery({ ...query, data });
          optimisticResponse = false;
        },
      });
    }
    if (isFunction(onClick)) onClick();
  };

  let message;

  switch (item.notification.notificationType.type) {
    case NotificationTypeTypeEnum.CALL_PARTNER_ONCE_PER_YEAR:
      message = t('No call logged in the past year');
      break;
    case NotificationTypeTypeEnum.LARGER_GIFT:
      if (amount) {
        message = t(
          'Gave a gift of {{ amount, currency }} which is greater than their commitment amount',
          {
            amount,
          },
        );
      } else {
        message = t('Gave a larger gift than their commitment amount');
      }
      break;
    case NotificationTypeTypeEnum.LONG_TIME_FRAME_GIFT:
      if (amount) {
        message = t(
          'Gave a gift of {{ amount, currency }} where commitment frequency is set to semi-annual or greater',
          {
            amount,
          },
        );
      } else {
        message = t(
          'Gave a gift where commitment frequency is set to semi-annual or greater',
        );
      }
      break;
    case NotificationTypeTypeEnum.MISSING_ADDRESS_IN_NEWSLETTER:
      message = t(
        'On your physical newsletter list but has no mailing address',
      );
      break;
    case NotificationTypeTypeEnum.MISSING_EMAIL_IN_NEWSLETTER:
      message = t(
        'On your email newsletter list but has no people with a valid email address',
      );
      break;
    case NotificationTypeTypeEnum.NEW_DESIGNATION_ACCOUNT_SUBSCRIPTION:
      message = t('Added through your Give Site subscription form');
      break;
    case NotificationTypeTypeEnum.NEW_PARTNER_DUPLICATE_MERGED:
      message = t('Added and merged');
      break;
    case NotificationTypeTypeEnum.NEW_PARTNER_DUPLICATE_NOT_MERGED:
      message = t('Added but not merged');
      break;
    case NotificationTypeTypeEnum.NEW_PARTNER_NO_DUPLICATE:
      message = t('Added with no duplicate found');
      break;
    case NotificationTypeTypeEnum.RECONTINUING_GIFT:
      message = t('Recontinued giving');
      break;
    case NotificationTypeTypeEnum.REMIND_PARTNER_IN_ADVANCE:
      message = t('Semi-annual or greater gift is expected one month from now');
      break;
    case NotificationTypeTypeEnum.SMALLER_GIFT:
      if (amount) {
        message = t(
          'Gave a gift of {{ amount, currency }} which is less than their commitment amount',
          {
            amount,
          },
        );
      } else {
        message = t('Gave a smaller gift than their commitment amount');
      }
      break;
    case NotificationTypeTypeEnum.SPECIAL_GIFT:
      if (amount) {
        message = t('Gave a special gift of {{ amount, currency }}', {
          amount,
        });
      } else {
        message = t('Gave a special gift');
      }
      break;
    case NotificationTypeTypeEnum.STARTED_GIVING:
      message = t('Started giving');
      break;
    case NotificationTypeTypeEnum.STOPPED_GIVING:
      message = t('Missed a gift');
      break;
    case NotificationTypeTypeEnum.THANK_PARTNER_ONCE_PER_YEAR:
      message = t('No thank you note logged in the past year');
      break;
    case NotificationTypeTypeEnum.UPCOMING_ANNIVERSARY:
      message = t('Upcoming anniversary');
      break;
    case NotificationTypeTypeEnum.UPCOMING_BIRTHDAY:
      message = t('Upcoming birthday');
      break;
    default:
      message = item.notification.notificationType.descriptionTemplate;
      break;
  }

  return (
    <Box>
      {previousItem?.notification?.occurredAt &&
        !isSameMonth(
          new Date(previousItem.notification.occurredAt),
          new Date(item.notification.occurredAt),
        ) && (
          <ListSubheader disableSticky role="heading">
            {monthYearFormat(
              new Date(item.notification.occurredAt).getMonth(),
              new Date(item.notification.occurredAt).getFullYear(),
            )}
          </ListSubheader>
        )}
      <HandoffLink path={`/contacts/${item.notification.contact.id}`}>
        <ListItem alignItems="flex-start" button onClick={handleClick}>
          <ListItemAvatar>
            <Badge
              color="secondary"
              variant="dot"
              overlap="circle"
              invisible={item.read}
              data-testid="NotificationMenuItemBadge"
            >
              <Avatar>{item.notification.contact.name[0]}</Avatar>
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={item.notification.contact.name}
            secondary={
              <>
                <Typography
                  component="span"
                  variant="body2"
                  color="textPrimary"
                >
                  {dateFormat(new Date(item.notification.occurredAt))}
                </Typography>{' '}
                — {message}
              </>
            }
          />
        </ListItem>
      </HandoffLink>
      {!last && <Divider variant="inset" />}
    </Box>
  );
};

export default NotificationMenuItem;
