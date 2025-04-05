import { MockedResponse } from '@apollo/client/testing';
import { NotificationTypeTypeEnum } from 'src/graphql/types.generated';
import {
  GetNotificationsDocument,
  GetNotificationsQuery,
} from './GetNotificationsQuery.generated';
import acknowledgeUserNotificationMutationMock from './Item/Item.mock';

export const notificationsQueryMockData: GetNotificationsQuery = {
  userNotifications: {
    nodes: [
      {
        id: 'd1b7a8c1-9b2e-4234-b2d6-e52c151bbc7b',
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
            type: NotificationTypeTypeEnum.UpcomingAnniversary,
            descriptionTemplate: 'Partner has upcoming anniversary',
          },
        },
      },
      {
        id: '5055f90b-fb09-4bf2-bbcd-09f29aeb5147',
        read: true,
        notification: {
          occurredAt: '2020-05-25T20:00:00-04:00',
          contact: {
            id: '942ea954-c251-44d6-8166-7a1879ecdbce',
            name: 'Robertson, Tara',
          },
          donation: null,
          notificationType: {
            id: '577da384-5452-4501-9ec5-d5b2754d29ae',
            type: NotificationTypeTypeEnum.UpcomingBirthday,
            descriptionTemplate: 'Partner has upcoming birthday',
          },
        },
      },
    ],
    pageInfo: { endCursor: 'Mg', hasNextPage: true },
    unreadCount: 2,
  },
};

export const notificationsQueryData2: GetNotificationsQuery = {
  userNotifications: {
    nodes: [
      {
        id: 'd1b7a8c1-9b2e-4234-b2d6-e52c151bbc7z',
        read: false,
        notification: {
          occurredAt: '2020-05-25T20:00:00-04:00',
          contact: {
            id: '942ea954-c251-44d6-8166-7a1879ecdbcx',
            name: 'Johnson, Ryan',
          },
          donation: null,
          notificationType: {
            id: '6eb32493-c51b-490a-955d-595642160a9l',
            type: NotificationTypeTypeEnum.UpcomingAnniversary,
            descriptionTemplate: 'Partner has upcoming anniversary',
          },
        },
      },
      {
        id: '5055f90b-fb09-4bf2-bbcd-09f29aeb514e',
        read: true,
        notification: {
          occurredAt: '2020-05-25T20:00:00-04:00',
          contact: {
            id: '942ea954-c251-44d6-8166-7a1879ecdbcl',
            name: 'Michaelson, Michelle',
          },
          donation: null,
          notificationType: {
            id: '577da384-5452-4501-9ec5-d5b2754d29sh',
            type: NotificationTypeTypeEnum.UpcomingBirthday,
            descriptionTemplate: 'Partner has upcoming birthday',
          },
        },
      },
    ],
    pageInfo: { endCursor: 'Np', hasNextPage: false },
    unreadCount: 2,
  },
};

export const notificationsEmptyMockData: GetNotificationsQuery = {
  userNotifications: {
    nodes: [],
    pageInfo: { endCursor: null, hasNextPage: false },
    unreadCount: 0,
  },
};

export const getNotificationsMocks = (): MockedResponse[] => {
  const mock = {
    request: {
      query: GetNotificationsDocument,
      variables: {
        accountListId: '1',
        after: null,
      },
    },
    result: {
      data: notificationsQueryMockData,
    },
  };

  const mock2 = {
    request: {
      query: GetNotificationsDocument,
      variables: {
        accountListId: '1',
        after: 'Mg',
      },
    },
    result: {
      data: notificationsQueryData2,
    },
  };
  return [
    mock,
    mock2,
    acknowledgeUserNotificationMutationMock(
      notificationsQueryMockData.userNotifications.nodes?.[0]?.id ?? '',
    ),
    acknowledgeUserNotificationMutationMock(
      notificationsQueryMockData.userNotifications.nodes?.[1]?.id ?? '',
    ),
  ];
};
