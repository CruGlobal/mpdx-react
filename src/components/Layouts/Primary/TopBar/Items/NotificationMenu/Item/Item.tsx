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
import { DateTime } from 'luxon';
import {
  dateFormat,
  monthYearFormat,
} from '../../../../../../../lib/intlFormat/intlFormat';
import HandoffLink from '../../../../../../HandoffLink';
import { NotificationTypeTypeEnum } from '../../../../../../../../graphql/types.generated';
import {
  GetNotificationsDocument,
  GetNotificationsQuery,
} from '../GetNotificationsQuery.generated';
import { useAccountListId } from '../../../../../../../hooks/useAccountListId';
import { useAcknowledgeUserNotificationMutation } from './AcknowledgeUserNotification.generated';

interface Props {
  item?: GetNotificationsQuery['userNotifications']['nodes'][0];
  last?: boolean;
  previousItem?: GetNotificationsQuery['userNotifications']['nodes'][0];
  onClick?: () => void;
}

const NotificationMenuItem = ({
  item,
  previousItem,
  last,
  onClick,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

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
  ] = useAcknowledgeUserNotificationMutation();
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
            query: GetNotificationsDocument,
            variables: {
              accountListId: accountListId,
              after: null,
            },
          };
          const dataFromCache = cache.readQuery<GetNotificationsQuery>(query);
          if (dataFromCache) {
            const data = {
              userNotifications: {
                ...dataFromCache.userNotifications,
                unreadCount: dataFromCache.userNotifications.unreadCount - 1,
              },
            };
            cache.writeQuery({ ...query, data });
            optimisticResponse = false;
          }
        },
      });
    }
    if (typeof onClick === 'function') onClick();
  };

  let message;

  switch (item.notification.notificationType.type) {
    case NotificationTypeTypeEnum.CallPartnerOncePerYear:
      message = t('No call logged in the past year');
      break;
    case NotificationTypeTypeEnum.LargerGift:
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
    case NotificationTypeTypeEnum.LongTimeFrameGift:
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
    case NotificationTypeTypeEnum.MissingAddressInNewsletter:
      message = t(
        'On your physical newsletter list but has no mailing address',
      );
      break;
    case NotificationTypeTypeEnum.MissingEmailInNewsletter:
      message = t(
        'On your email newsletter list but has no people with a valid email address',
      );
      break;
    case NotificationTypeTypeEnum.NewDesignationAccountSubscription:
      message = t('Added through your Give Site subscription form');
      break;
    case NotificationTypeTypeEnum.NewPartnerDuplicateMerged:
      message = t('Added and merged');
      break;
    case NotificationTypeTypeEnum.NewPartnerDuplicateNotMerged:
      message = t('Added but not merged');
      break;
    case NotificationTypeTypeEnum.NewPartnerNoDuplicate:
      message = t('Added with no duplicate found');
      break;
    case NotificationTypeTypeEnum.RecontinuingGift:
      message = t('Recontinued giving');
      break;
    case NotificationTypeTypeEnum.RemindPartnerInAdvance:
      message = t('Semi-annual or greater gift is expected one month from now');
      break;
    case NotificationTypeTypeEnum.SmallerGift:
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
    case NotificationTypeTypeEnum.SpecialGift:
      if (amount) {
        message = t('Gave a special gift of {{ amount, currency }}', {
          amount,
        });
      } else {
        message = t('Gave a special gift');
      }
      break;
    case NotificationTypeTypeEnum.StartedGiving:
      message = t('Started giving');
      break;
    case NotificationTypeTypeEnum.StoppedGiving:
      message = t('Missed a gift');
      break;
    case NotificationTypeTypeEnum.ThankPartnerOncePerYear:
      message = t('No thank you note logged in the past year');
      break;
    case NotificationTypeTypeEnum.UpcomingAnniversary:
      message = t('Upcoming anniversary');
      break;
    case NotificationTypeTypeEnum.UpcomingBirthday:
      message = t('Upcoming birthday');
      break;
    default:
      message = item.notification.notificationType.descriptionTemplate;
      break;
  }

  return (
    <Box>
      {previousItem?.notification?.occurredAt &&
        !DateTime.fromISO(previousItem.notification.occurredAt).hasSame(
          DateTime.fromISO(item.notification.occurredAt),
          'month',
        ) && (
          <ListSubheader disableSticky role="heading">
            {monthYearFormat(
              DateTime.fromISO(item.notification.occurredAt).month,
              DateTime.fromISO(item.notification.occurredAt).year,
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
                  {dateFormat(DateTime.fromISO(item.notification.occurredAt))}
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
