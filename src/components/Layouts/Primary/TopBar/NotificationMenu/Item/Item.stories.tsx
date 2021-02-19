import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { NotificationTypeTypeEnum } from '../../../../../../../types/globalTypes';
import { GetNotificationsQuery_userNotifications_edges_node as Notification } from '../../../../../../../types/GetNotificationsQuery';
import acknowledgeUserNotificationMutationMock from './Item.mock';
import NotificationMenuItem from '.';

export default {
  title: 'Layouts/Primary/TopBar/NotificationMenu/Item',
};

export const Default = (): ReactElement => {
  const id = 'd1b7a8c1-9b2e-4234-b2d6-e52c151bbc7b';
  const itemWithoutDonation = (
    type: NotificationTypeTypeEnum,
  ): Notification => {
    return {
      id,
      read: false,
      notification: {
        occurredAt: '2020-05-25T20:00:00-04:00',
        contact: {
          id: '942ea954-c251-44d6-8166-7a1879ecdbc7',
          name: 'Smith, Roger',
        },
        donation: null,
        notificationType: {
          id: '6eb32493-c51b-490a-955d-595642160a95',
          type,
          descriptionTemplate: 'Partner has upcoming anniversary',
        },
      },
    };
  };
  const itemWithDonation = (type: NotificationTypeTypeEnum): Notification => {
    return {
      id,
      read: false,
      notification: {
        occurredAt: '2020-05-25T20:00:00-04:00',
        contact: {
          id: '942ea954-c251-44d6-8166-7a1879ecdbc7',
          name: 'Smith, Roger',
        },
        donation: {
          id: '942ea954-c251-44d6-8166-7a1879ecdbc4',
          amount: {
            amount: 10000,
            currency: 'AUD',
            conversionDate: '2020-10-05',
          },
        },
        notificationType: {
          id: '6eb32493-c51b-490a-955d-595642160a95',
          type,
          descriptionTemplate: 'Partner has upcoming anniversary',
        },
      },
    };
  };
  return (
    <MockedProvider
      mocks={[acknowledgeUserNotificationMutationMock(id)]}
      addTypename={false}
    >
      <>
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.CALL_PARTNER_ONCE_PER_YEAR,
          )}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.LARGER_GIFT)}
        />
        <NotificationMenuItem
          item={itemWithDonation(NotificationTypeTypeEnum.LARGER_GIFT)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.LONG_TIME_FRAME_GIFT,
          )}
        />
        <NotificationMenuItem
          item={itemWithDonation(NotificationTypeTypeEnum.LONG_TIME_FRAME_GIFT)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.MISSING_ADDRESS_IN_NEWSLETTER,
          )}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.MISSING_EMAIL_IN_NEWSLETTER,
          )}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.RECONTINUING_GIFT)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.REMIND_PARTNER_IN_ADVANCE,
          )}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.SMALLER_GIFT)}
        />
        <NotificationMenuItem
          item={itemWithDonation(NotificationTypeTypeEnum.SMALLER_GIFT)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.SMALLER_GIFT)}
        />
        <NotificationMenuItem
          item={itemWithDonation(NotificationTypeTypeEnum.SPECIAL_GIFT)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.STARTED_GIVING)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.STOPPED_GIVING)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.THANK_PARTNER_ONCE_PER_YEAR,
          )}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.UPCOMING_ANNIVERSARY,
          )}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.UPCOMING_BIRTHDAY)}
          last
        />
      </>
    </MockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <>
      <NotificationMenuItem />
      <NotificationMenuItem last />
    </>
  );
};
