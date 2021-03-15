import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { GetNotificationsQuery } from '../GetNotificationsQuery.generated';
import { NotificationTypeTypeEnum } from '../../../../../../../../graphql/types.generated';
import acknowledgeUserNotificationMutationMock from './Item.mock';
import NotificationMenuItem from '.';

export default {
  title: 'Layouts/Primary/TopBar/Items/NotificationMenu/Item',
};

export const Default = (): ReactElement => {
  const id = 'd1b7a8c1-9b2e-4234-b2d6-e52c151bbc7b';
  const itemWithoutDonation = (
    type: NotificationTypeTypeEnum,
  ): GetNotificationsQuery['userNotifications']['edges'][0]['node'] => {
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
  const itemWithDonation = (
    type: NotificationTypeTypeEnum,
  ): GetNotificationsQuery['userNotifications']['edges'][0]['node'] => {
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
            NotificationTypeTypeEnum.CallPartnerOncePerYear,
          )}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.LargerGift)}
        />
        <NotificationMenuItem
          item={itemWithDonation(NotificationTypeTypeEnum.LargerGift)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.LongTimeFrameGift)}
        />
        <NotificationMenuItem
          item={itemWithDonation(NotificationTypeTypeEnum.LongTimeFrameGift)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.MissingAddressInNewsletter,
          )}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.MissingEmailInNewsletter,
          )}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.RecontinuingGift)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.RemindPartnerInAdvance,
          )}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.SmallerGift)}
        />
        <NotificationMenuItem
          item={itemWithDonation(NotificationTypeTypeEnum.SmallerGift)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.SmallerGift)}
        />
        <NotificationMenuItem
          item={itemWithDonation(NotificationTypeTypeEnum.SpecialGift)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.StartedGiving)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.StoppedGiving)}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.ThankPartnerOncePerYear,
          )}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.UpcomingAnniversary,
          )}
        />
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.UpcomingBirthday)}
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
